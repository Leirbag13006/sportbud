/** Utilitaires de formatage (dates, durées, noms) en français. */

const dayFormatter = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const timeFormatter = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

/** Nom pour s'adresser au membre : son prénom s'il l'a renseigné, sinon son pseudo. */
export function getFirstName(user: { fullName: string | null; username: string }) {
  return user.fullName?.split(" ")[0] || user.username;
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

/** « Aujourd'hui », « Demain » ou « samedi 27 septembre ». */
export function formatDay(date: Date, now = new Date()) {
  if (isSameDay(date, now)) return "Aujourd'hui";
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (isSameDay(date, tomorrow)) return "Demain";
  const label = dayFormatter.format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** « 18:00 ». */
export function formatTime(date: Date) {
  return timeFormatter.format(date);
}

/** Créneau d'une activité : « 17:00-18:30 ». */
export function formatTimeRange(start: Date, durationMinutes: number) {
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  return `${formatTime(start)}-${formatTime(end)}`;
}

/** Heure courte à la française : « 19h », « 19h30 ». */
export function formatHour(date: Date) {
  const minutes = date.getMinutes();
  return `${date.getHours()}h${minutes ? String(minutes).padStart(2, "0") : ""}`;
}

/** « 45 min », « 1 h », « 1 h 30 ». */
export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${String(rest).padStart(2, "0")}`;
}

/**
 * Initiales pour les avatars sans photo : « Camille Martin » → « CM », « camille_run » → « CR »,
 * « bruno13 » → « BR ».
 */
export function getInitials(name: string) {
  const parts = name.split(/[\s._-]+/).filter((part) => /[a-zà-ÿ]/i.test(part));
  if (parts.length >= 2) return parts.slice(0, 2).map((part) => part[0]!.toUpperCase()).join("");
  return (parts[0] ?? name).replace(/[^a-zà-ÿ]/gi, "").slice(0, 2).toUpperCase() || "?";
}

const wholeEuros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const centsEuros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });

/** « Gratuit », « 8 € », « 7,50 € ». */
export function formatPrice(cents: number) {
  if (cents <= 0) return "Gratuit";
  return cents % 100 === 0 ? wholeEuros.format(cents / 100) : centsEuros.format(cents / 100);
}

/** « 1 place », « 3 places ». */
export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count > 1 ? plural : singular}`;
}

const shortDateFormatter = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });

/** Horodatage compact d'une liste : « 14:32 » aujourd'hui, « Hier », sinon « 12 sept. ». */
export function formatRelativeShort(date: Date, now = new Date()) {
  if (isSameDay(date, now)) return formatTime(date);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return "Hier";
  return shortDateFormatter.format(date);
}

/** Libellé de séparateur de jour dans une conversation : « Aujourd'hui », « Hier », « Samedi 26 septembre ». */
export function formatDaySeparator(date: Date, now = new Date()) {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return "Hier";
  return formatDay(date, now);
}

export { isSameDay };

/*
 * Rendu côté serveur (pages publiques, images de partage) : le serveur tourne en UTC, les dates
 * sont donc formatées explicitement à l'heure de Paris (le service est en France).
 */
const PARIS = "Europe/Paris";
const parisDayKey = new Intl.DateTimeFormat("fr-CA", { timeZone: PARIS, year: "numeric", month: "2-digit", day: "2-digit" });
const parisDay = new Intl.DateTimeFormat("fr-FR", { timeZone: PARIS, weekday: "long", day: "numeric", month: "long" });
const parisTime = new Intl.DateTimeFormat("fr-FR", { timeZone: PARIS, hour: "2-digit", minute: "2-digit" });

/**
 * formatDay à l'heure de Paris : « Aujourd'hui », « Demain » ou « Samedi 27 septembre ».
 * relative = false : toujours la date complète (aperçus de liens, gardés en cache par les messageries).
 */
export function formatDayInParis(date: Date, { relative = true, now = new Date() } = {}) {
  const key = parisDayKey.format(date);
  if (!relative) return capitalize(parisDay.format(date));
  if (key === parisDayKey.format(now)) return "Aujourd'hui";
  if (key === parisDayKey.format(new Date(now.getTime() + 24 * 60 * 60 * 1000))) return "Demain";
  return capitalize(parisDay.format(date));
}

function capitalize(label: string) {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** formatTimeRange à l'heure de Paris : « 17:00-18:30 ». */
export function formatTimeRangeInParis(start: Date, durationMinutes: number) {
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  return `${parisTime.format(start)}-${parisTime.format(end)}`;
}
