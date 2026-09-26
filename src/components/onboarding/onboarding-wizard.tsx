"use client";

import { ArrowLeft, ArrowRight, Check, Loader2, LocateFixed, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { SportIcon } from "@/components/brand/sport-icon";
import { Logo } from "@/components/layout/logo";
import { AddressSearch } from "@/components/map/address-search";
import { Button } from "@/components/ui/button";
import { SPORT_LEVELS } from "@/config/sport-levels";
import { SPORTS } from "@/config/sports";
import { GENDER_OPTIONS } from "@/config/audience";
import type { Gender, SportLevel, SportType } from "@/db/schema";
import { reverseGeocodeCity } from "@/lib/geocoding";
import { completeOnboarding, skipOnboarding } from "@/lib/onboarding/actions";
import { cn } from "@/lib/utils";
import { MAX_FAVORITE_SPORTS } from "@/lib/validations/profile";
import { PhotoBackdrop } from "@/components/brand/photo-backdrop";

type City = { name: string; lat: number; lng: number };

const STEPS = [
  { title: "Tes", accent: "sports.", description: "Choisis jusqu'à 5 sports : on te montrera d'abord les séances qui te correspondent." },
  { title: "Ton", accent: "niveau.", description: "Pour te proposer des séances où tu seras à l'aise. Tu pourras le changer à tout moment." },
  { title: "Ta", accent: "ville.", description: "Le point de départ de tes recherches si tu ne partages pas ta position." },
] as const;

interface OnboardingWizardProps {
  firstName: string;
  /** Page ouverte à la fin du parcours (l'Explorer, ou la séance partagée qui a amené le membre). */
  redirectTo: string;
  initial: { favoriteSports: SportType[]; sportLevel: SportLevel };
}

/** Parcours d'accueil en 3 étapes, affiché une seule fois après l'inscription. */
export function OnboardingWizard({ firstName, redirectTo, initial }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [sports, setSports] = useState<SportType[]>(initial.favoriteSports);
  const [level, setLevel] = useState<SportLevel | null>(null);
  const [gender, setGender] = useState<Gender | "">("");
  const [city, setCity] = useState<City | null>(null);
  const [isPending, startTransition] = useTransition();
  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;
  const canContinue = step === 0 ? sports.length > 0 : step === 1 ? level !== null : true;

  const toggleSport = (sport: SportType) =>
    setSports((selected) => {
      if (selected.includes(sport)) return selected.filter((item) => item !== sport);
      if (selected.length >= MAX_FAVORITE_SPORTS) {
        toast.info(`${MAX_FAVORITE_SPORTS} sports maximum.`);
        return selected;
      }
      return [...selected, sport];
    });

  const finish = () =>
    startTransition(async () => {
      const result = await completeOnboarding({
        favoriteSports: sports,
        sportLevel: level ?? initial.sportLevel,
        gender,
        city,
      });
      if (result.ok) {
        toast.success(`Bienvenue dans la communauté, ${firstName} !`);
        router.replace(redirectTo);
      } else {
        toast.error(result.error ?? Object.values(result.fieldErrors ?? {}).flat()[0] ?? "Une erreur est survenue.");
      }
    });

  const skip = () =>
    startTransition(async () => {
      const result = await skipOnboarding();
      if (result.ok) router.replace(redirectTo);
      else toast.error(result.error ?? "Une erreur est survenue.");
    });

  return (
    <div className="flex min-h-dvh flex-col bg-sand-50">
      <header className="sl-dark relative overflow-hidden">
        <PhotoBackdrop src="/images/hero-friends-sunset.jpg" blur="sm" veil="left" position="center 40%" priority />
        <div className="relative mx-auto w-full max-w-2xl px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-8 md:px-6">
          <div className="flex items-center justify-between gap-4">
            <Logo variant="dark" size="sm" href={null} />
            <Button variant="ghost" size="sm" className="text-white/75 hover:text-white" onClick={skip} disabled={isPending}>
              Plus tard
            </Button>
          </div>

          <p className="mt-8 font-display text-xs font-bold tracking-eyebrow text-mint-500 uppercase">
            Bienvenue {firstName} · Étape {step + 1} sur {STEPS.length}
          </p>
          <h1 className="sl-bar mt-2 text-3xl font-extrabold md:text-4xl">
            {current.title} <span className="text-mint-500">{current.accent}</span>
          </h1>
          <p className="mt-4 max-w-lg text-pretty">{current.description}</p>

          {/* Progression */}
          <div className="mt-6 flex gap-1.5" aria-hidden>
            {STEPS.map((item, index) => (
              <span
                key={item.accent}
                className={cn("h-1 flex-1 rounded-full transition-colors", index <= step ? "bg-mint-500" : "bg-white/15")}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 md:px-6">
        {step === 0 && (
          <fieldset>
            <legend className="sr-only">Tes sports favoris</legend>
            <p className="mb-3 text-sm">
              <span className="font-display font-bold text-ink">{sports.length}</span>/{MAX_FAVORITE_SPORTS} sélectionnés
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {SPORTS.map((sport) => {
                const selected = sports.includes(sport.value);
                return (
                  <button
                    key={sport.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleSport(sport.value)}
                    className={cn(
                      "relative flex min-h-24 flex-col items-center justify-center gap-2 rounded-card border-2 bg-card p-3 text-sm font-semibold text-ink shadow-sm transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring",
                      selected ? "border-mint-500 shadow-md" : "border-transparent hover:-translate-y-0.5 hover:shadow-md",
                    )}
                  >
                    {selected && (
                      <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-mint-500 text-night-950">
                        <Check className="size-3.5" strokeWidth={3} aria-hidden />
                      </span>
                    )}
                    <SportIcon sport={sport.value} className="size-9" />
                    {sport.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset className="grid gap-3">
            <legend className="sr-only">Ton niveau</legend>
            {SPORT_LEVELS.map((option, index) => {
              const selected = level === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setLevel(option.value)}
                  className={cn(
                    "flex items-center gap-4 rounded-card border-2 bg-card p-4 text-left shadow-sm transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring",
                    selected ? "border-mint-500 shadow-md" : "border-transparent hover:shadow-md",
                  )}
                >
                  {/* Jauge : 1 à 3 barres selon le niveau */}
                  <span className="flex h-8 items-end gap-1" aria-hidden>
                    {[0, 1, 2].map((bar) => (
                      <span
                        key={bar}
                        className={cn("w-2 rounded-sm", bar <= index ? "bg-mint-500" : "bg-sand-100")}
                        style={{ height: `${(bar + 1) * 33}%` }}
                      />
                    ))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display font-bold text-ink">{option.label}</span>
                    <span className="block text-sm">{option.description}</span>
                  </span>
                  {selected && <Check className="size-5 text-mint-700" aria-hidden />}
                </button>
              );
            })}
          </fieldset>
        )}

        {step === 1 && (
          <fieldset className="mt-8">
            <legend className="font-display font-bold text-ink">Tu es… (facultatif)</legend>
            <p className="mt-1 mb-3 text-sm">
              Jamais affiché. Permet de rejoindre ou d&apos;organiser des séances entre femmes / entre hommes.
            </p>
            <div className="flex flex-wrap gap-2">
              {GENDER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={gender === option.value}
                  onClick={() => setGender((current) => (current === option.value ? "" : option.value))}
                  className={cn(
                    "min-h-11 rounded-full border bg-card px-4 text-sm transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring",
                    gender === option.value && "border-mint-500 bg-mint-100 font-semibold text-mint-700 hover:bg-mint-100",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 2 && <CityStep city={city} onChange={setCity} />}
      </main>

      <footer className="sticky bottom-0 border-t bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-6">
          <Button variant="ghost" onClick={() => setStep((value) => value - 1)} disabled={step === 0 || isPending}>
            <ArrowLeft aria-hidden />
            Retour
          </Button>
          {isLast ? (
            <Button onClick={finish} disabled={isPending} className="min-w-40">
              {isPending ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />}
              {city ? "C'est parti !" : "Terminer sans ville"}
            </Button>
          ) : (
            <Button onClick={() => setStep((value) => value + 1)} disabled={!canContinue} className="min-w-40">
              Continuer
              <ArrowRight aria-hidden />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}

/** Choix de la ville : recherche (communes françaises) ou position actuelle. */
function CityStep({ city, onChange }: { city: City | null; onChange: (city: City | null) => void }) {
  const [isLocating, setIsLocating] = useState(false);

  const useMyPosition = () => {
    if (!("geolocation" in navigator)) {
      toast.warning("La localisation n'est pas disponible sur cet appareil.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const position: [number, number] = [coords.latitude, coords.longitude];
        const name = await reverseGeocodeCity(position).catch(() => null);
        onChange({ name: name ?? "Ma position", lat: position[0], lng: position[1] });
        setIsLocating(false);
      },
      () => {
        toast.info("Position non partagée : cherche ta ville ci-dessous.");
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10_000 },
    );
  };

  return (
    <div className="space-y-4">
      <AddressSearch
        citiesOnly
        defaultValue={city?.name ?? ""}
        onSelect={(suggestion) =>
          onChange({ name: suggestion.name, lat: suggestion.position[0], lng: suggestion.position[1] })
        }
      />

      <div className="flex items-center gap-3 text-xs text-gray-400" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        ou
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button variant="outline" className="w-full" onClick={useMyPosition} disabled={isLocating}>
        {isLocating ? <Loader2 className="animate-spin" aria-hidden /> : <LocateFixed aria-hidden />}
        Utiliser ma position actuelle
      </Button>

      {city && (
        <p className="flex items-center gap-3 rounded-card bg-card p-4 text-sm shadow-md" aria-live="polite">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-mint-100 text-mint-700">
            <MapPin className="size-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display font-bold text-ink">{city.name}</span>
            Les séances seront classées par distance depuis cette ville.
          </span>
        </p>
      )}
    </div>
  );
}
