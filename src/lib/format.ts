/** Utilitaires de formatage (dates, durées, noms) en français. */

const dayFormatter = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const timeFormatter = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

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

/** Initiales pour les avatars sans photo (« Camille Martin » → « CM »). */
export function getInitials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
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
