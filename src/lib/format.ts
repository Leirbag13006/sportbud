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
