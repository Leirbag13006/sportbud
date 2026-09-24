-- =============================================================================
-- SportBud — Schéma initial
-- Tables : profiles, activities, applications, messages
-- + types énumérés, triggers d'intégrité et Row Level Security (RLS).
--
-- À exécuter une seule fois dans Supabase : SQL Editor → New query → Run.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Types énumérés
-- -----------------------------------------------------------------------------

create type public.sport_level as enum ('beginner', 'intermediate', 'pro');

create type public.sport_type as enum (
  'football', 'basketball', 'tennis', 'padel', 'badminton', 'volleyball',
  'running', 'cycling', 'swimming', 'climbing', 'fitness', 'other'
);

create type public.activity_status as enum ('open', 'full', 'cancelled');

create type public.application_status as enum ('pending', 'accepted', 'rejected');


-- -----------------------------------------------------------------------------
-- 2. Fonctions utilitaires
-- -----------------------------------------------------------------------------

-- Met à jour automatiquement la colonne updated_at à chaque modification.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- -----------------------------------------------------------------------------
-- 3. Profils (1-1 avec auth.users)
--    L'email reste dans auth.users : il n'est jamais exposé aux autres membres.
-- -----------------------------------------------------------------------------

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null check (char_length(trim(full_name)) between 2 and 80),
  bio         text check (char_length(bio) <= 500),
  sport_level public.sport_level not null default 'beginner',
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Crée le profil automatiquement à l'inscription, à partir des métadonnées
-- (full_name, sport_level) envoyées par le formulaire d'inscription.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta_level text := new.raw_user_meta_data ->> 'sport_level';
begin
  insert into public.profiles (id, full_name, sport_level)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Sportif'),
    case
      when meta_level in ('beginner', 'intermediate', 'pro') then meta_level::public.sport_level
      else 'beginner'
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- -----------------------------------------------------------------------------
-- 4. Activités
-- -----------------------------------------------------------------------------

create table public.activities (
  id               uuid primary key default gen_random_uuid(),
  creator_id       uuid not null references public.profiles (id) on delete cascade,
  sport_type       public.sport_type not null,
  description      text check (char_length(description) <= 500),
  location_name    text check (char_length(location_name) <= 120),
  lat              double precision not null check (lat between -90 and 90),
  lng              double precision not null check (lng between -180 and 180),
  starts_at        timestamptz not null,
  duration_minutes integer not null default 60 check (duration_minutes between 15 and 720),
  required_level   public.sport_level,            -- null = tous niveaux
  spots_total      integer not null check (spots_total between 1 and 50),
  spots_available  integer not null default 0,  -- initialisé à spots_total par trigger
  status           public.activity_status not null default 'open',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint activities_spots_range
    check (spots_available between 0 and spots_total)
);

create index activities_status_starts_at_idx on public.activities (status, starts_at);
create index activities_creator_id_idx on public.activities (creator_id);

create trigger activities_set_updated_at
  before update on public.activities
  for each row execute function public.set_updated_at();

-- Garantit la cohérence places / statut, quel que soit le client qui écrit :
--  - à la création, toutes les places sont disponibles ;
--  - une activité non annulée est 'full' si et seulement si il ne reste aucune place.
create function public.sync_activity_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.spots_available := new.spots_total;
  end if;

  if new.status <> 'cancelled' then
    new.status := case when new.spots_available = 0 then 'full' else 'open' end;
  end if;

  return new;
end;
$$;

create trigger activities_sync_status
  before insert or update on public.activities
  for each row execute function public.sync_activity_status();


-- -----------------------------------------------------------------------------
-- 5. Candidatures
-- -----------------------------------------------------------------------------

create table public.applications (
  id           uuid primary key default gen_random_uuid(),
  activity_id  uuid not null references public.activities (id) on delete cascade,
  applicant_id uuid not null references public.profiles (id) on delete cascade,
  status       public.application_status not null default 'pending',
  message      text check (char_length(message) <= 300),  -- mot facultatif au créateur
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  -- Une seule candidature par personne et par activité.
  constraint applications_unique_applicant unique (activity_id, applicant_id)
);

create index applications_applicant_id_idx on public.applications (applicant_id);

create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();


-- -----------------------------------------------------------------------------
-- 6. Messages (une conversation = une candidature acceptée, entre créateur et candidat)
-- -----------------------------------------------------------------------------

create table public.messages (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  sender_id      uuid not null references public.profiles (id) on delete cascade,
  content        text not null check (char_length(trim(content)) between 1 and 2000),
  read_at        timestamptz,                     -- null = non lu par le destinataire
  created_at     timestamptz not null default now()
);

create index messages_application_id_created_at_idx
  on public.messages (application_id, created_at);


-- -----------------------------------------------------------------------------
-- 7. Fonctions d'aide pour la RLS
--    security definer : évite la récursion entre les policies de tables liées.
-- -----------------------------------------------------------------------------

-- Vrai si l'utilisateur courant a créé l'activité.
create function public.is_activity_creator(p_activity_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.activities
    where id = p_activity_id and creator_id = auth.uid()
  );
$$;

-- Vrai si l'utilisateur courant est le candidat ou le créateur d'une candidature ACCEPTÉE.
create function public.is_conversation_participant(p_application_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.applications a
    join public.activities act on act.id = a.activity_id
    where a.id = p_application_id
      and a.status = 'accepted'
      and auth.uid() in (a.applicant_id, act.creator_id)
  );
$$;


-- -----------------------------------------------------------------------------
-- 8. Row Level Security
--    Aucune donnée n'est accessible sans être connecté (rôle anon exclu).
-- -----------------------------------------------------------------------------

alter table public.profiles     enable row level security;
alter table public.activities   enable row level security;
alter table public.applications enable row level security;
alter table public.messages     enable row level security;

-- Profils : visibles par tous les membres, modifiables uniquement par leur propriétaire.
create policy "Profils visibles par les membres"
  on public.profiles for select to authenticated
  using (true);

create policy "Chacun modifie son profil"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Activités : visibles par tous les membres, gérées par leur créateur.
create policy "Activités visibles par les membres"
  on public.activities for select to authenticated
  using (true);

create policy "Création d'activité en son nom"
  on public.activities for insert to authenticated
  with check (creator_id = (select auth.uid()) and starts_at > now());

create policy "Le créateur modifie son activité"
  on public.activities for update to authenticated
  using (creator_id = (select auth.uid()))
  with check (creator_id = (select auth.uid()));

create policy "Le créateur supprime son activité"
  on public.activities for delete to authenticated
  using (creator_id = (select auth.uid()));

-- Droits de mise à jour colonne par colonne : les champs système (id, créateur,
-- places disponibles, dates techniques) ne peuvent pas être modifiés depuis le client.
-- Les places sont décrémentées uniquement par la fonction d'acceptation (étape 5).
revoke update on public.profiles from anon, authenticated;
grant update (full_name, bio, sport_level, avatar_url) on public.profiles to authenticated;

revoke update on public.activities from anon, authenticated;
grant update (
  sport_type, description, location_name, lat, lng,
  starts_at, duration_minutes, required_level, status
) on public.activities to authenticated;

-- Candidatures : visibles par le candidat et par le créateur de l'activité.
-- L'acceptation / le refus passeront par une fonction transactionnelle (étape 5).
create policy "Candidatures visibles par les parties"
  on public.applications for select to authenticated
  using (
    applicant_id = (select auth.uid())
    or public.is_activity_creator(activity_id)
  );

create policy "Postuler à une activité ouverte"
  on public.applications for insert to authenticated
  with check (
    applicant_id = (select auth.uid())
    and status = 'pending'
    and not public.is_activity_creator(activity_id)
    and exists (
      select 1 from public.activities
      where id = activity_id and status = 'open' and starts_at > now()
    )
  );

create policy "Retirer sa candidature en attente"
  on public.applications for delete to authenticated
  using (applicant_id = (select auth.uid()) and status = 'pending');

-- Messages : lus et envoyés uniquement par les deux participants d'une candidature acceptée.
create policy "Messages visibles par les participants"
  on public.messages for select to authenticated
  using (public.is_conversation_participant(application_id));

create policy "Envoyer un message dans sa conversation"
  on public.messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and public.is_conversation_participant(application_id)
  );
