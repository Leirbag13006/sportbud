/** Utilitaires de formatage (dates, durées, noms) en français. */

/*
 * Toutes les dates sont affichées à l'heure de Paris (le service est en France), que le rendu ait
 * lieu dans le navigateur ou sur le serveur (qui tourne en UTC sur Vercel).
 */
const TIME_ZONE = "Europe/Paris";
const dayFormatter = new Intl.DateTimeFormat("fr-FR", { timeZone: TIME_ZONE, weekday: "long", day: "numeric", month: "long" });
const timeFormatter = new Intl.DateTimeFormat("fr-FR", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit" });
const dayKeyFormatter = new Intl.DateTimeFormat("fr-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });
const DAY_MS = 24 * 60 * 60 * 1000;

/** Nom pour s'adresser au membre : son prénom s'il l'a renseigné, sinon son pseudo. */
export function getFirstName(user: { fullName: string | null; username: string }) {
  return user.fullName?.split(" ")[0] || user.username;
}

/** Même jour calendaire à Paris. */
function isSameDay(a: Date, b: Date) {
  return dayKeyFormatter.format(a) === dayKeyFormatter.format(b);
}

function capitalize(label: string) {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Date complète : « Samedi 27 septembre » (aperçus de liens, où « Demain » deviendrait faux). */
export function formatFullDay(date: Date) {
  return capitalize(dayFormatter.format(date));
}

/** « Aujourd'hui », « Demain » ou « Samedi 27 septembre ». */
export function formatDay(date: Date, now = new Date()) {
  if (isSameDay(date, now)) return "Aujourd'hui";
  if (isSameDay(date, new Date(now.getTime() + DAY_MS))) return "Demain";
  return formatFullDay(date);
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
  const [hours, minutes] = formatTime(date).split(":");
  return `${Number(hours)}h${minutes === "00" ? "" : minutes}`;
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

const shortDateFormatter = new Intl.DateTimeFormat("fr-FR", { timeZone: TIME_ZONE, day: "numeric", month: "short" });

/** Horodatage compact d'une liste : « 14:32 » aujourd'hui, « Hier », sinon « 12 sept. ». */
export function formatRelativeShort(date: Date, now = new Date()) {
  if (isSameDay(date, now)) return formatTime(date);
  if (isSameDay(date, new Date(now.getTime() - DAY_MS))) return "Hier";
  return shortDateFormatter.format(date);
}

/** Libellé de séparateur de jour dans une conversation : « Aujourd'hui », « Hier », « Samedi 26 septembre ». */
export function formatDaySeparator(date: Date, now = new Date()) {
  if (isSameDay(date, new Date(now.getTime() - DAY_MS))) return "Hier";
  return formatDay(date, now);
}

export { isSameDay };
