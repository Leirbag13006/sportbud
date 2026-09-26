import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";
import sharp from "sharp";

import { getActivityTitle, getSport } from "@/config/sports";
import { getSportLevelLabel } from "@/config/sport-levels";
import { getPublicActivity } from "@/lib/activities/public";
import { formatFullDay, formatPrice, formatTimeRange, pluralize } from "@/lib/format";

/** Image d'aperçu du lien (WhatsApp, réseaux) : photo N&B du sport, titre, date et places. */
export const alt = "Séance SportMates";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Couleurs du design system (tokens night-950 / mint-500), en dur : l'image est rendue hors CSS.
const NIGHT = "#050f0d";
const MINT = "#2fe0a0";

const assets = Promise.all([
  readFile(join(process.cwd(), "src/assets/fonts/Montserrat-ExtraBold.ttf")),
  readFile(join(process.cwd(), "src/assets/fonts/Montserrat-SemiBold.ttf")),
  readFile(join(process.cwd(), "src/app/icon.svg"), "base64"),
]);

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const [activity, [extraBold, semiBold, icon]] = await Promise.all([getPublicActivity((await params).id), assets]);

  const sport = activity ? getSport(activity.sportType) : null;
  // Photo en noir et blanc, comme partout sur le site (le rendu d'image ne gère pas les filtres CSS).
  const photo = sport
    ? await sharp(join(process.cwd(), "public", sport.image)).grayscale().resize(1200, 630, { fit: "cover" }).jpeg({ quality: 70 }).toBuffer()
    : null;

  const isOpen = activity?.status === "open" && !activity.ended;
  const title = activity
    ? getActivityTitle(activity.sportType, activity.status === "open" ? activity.spotsAvailable : activity.spotsTotal)
    : "Séance introuvable";

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: NIGHT, position: "relative", fontFamily: "Montserrat" }}>
        {photo && (
          <img src={`data:image/jpeg;base64,${photo.toString("base64")}`} alt="" width={1200} height={630} style={{ position: "absolute", top: 0, left: 0 }} />
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size.width,
            height: size.height,
            backgroundImage: `linear-gradient(90deg, ${NIGHT} 0%, rgba(5,15,13,0.9) 50%, rgba(5,15,13,0.5) 100%)`,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 64px", width: "100%", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img src={`data:image/svg+xml;base64,${icon}`} alt="" width={64} height={64} />
            <span style={{ fontSize: 40, fontWeight: 800, color: "white", fontStyle: "italic" }}>
              Sport<span style={{ color: MINT }}>Mates</span>
            </span>
          </div>

          {activity && sport ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 30, fontWeight: 600, color: MINT, letterSpacing: 2, textTransform: "uppercase" }}>
                {sport.label} ·{" "}
                {activity.requiredLevel ? `Niveau ${getSportLevelLabel(activity.requiredLevel).toLowerCase()}` : "Tous niveaux"}
              </span>
              <span style={{ fontSize: 76, fontWeight: 800, color: "white", lineHeight: 1.05, marginTop: 12, maxWidth: 980 }}>{title}</span>
              <span style={{ fontSize: 36, fontWeight: 600, color: "rgba(255,255,255,0.88)", marginTop: 24 }}>
                {formatFullDay(activity.startsAt)} · {formatTimeRange(activity.startsAt, activity.durationMinutes)}
                {activity.area ? ` · ${activity.area}` : ""}
              </span>
            </div>
          ) : (
            <span style={{ fontSize: 64, fontWeight: 800, color: "white" }}>{title}</span>
          )}

          <div style={{ display: "flex", gap: 16 }}>
            {activity && (
              <span
                style={{
                  display: "flex",
                  fontSize: 30,
                  fontWeight: 800,
                  padding: "12px 26px",
                  borderRadius: 999,
                  background: isOpen ? MINT : "rgba(255,255,255,0.15)",
                  color: isOpen ? NIGHT : "white",
                }}
              >
                {isOpen ? `${pluralize(activity.spotsAvailable, "place")} libre${activity.spotsAvailable > 1 ? "s" : ""}` : activity.ended ? "Terminée" : activity.status === "cancelled" ? "Annulée" : "Complet"}
              </span>
            )}
            {activity && (
              <span style={{ display: "flex", fontSize: 30, fontWeight: 800, padding: "12px 26px", borderRadius: 999, border: "3px solid rgba(255,255,255,0.35)", color: "white" }}>
                {formatPrice(activity.priceCents)}
              </span>
            )}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Montserrat", data: extraBold, weight: 800, style: "normal" },
        { name: "Montserrat", data: semiBold, weight: 600, style: "normal" },
      ],
    },
  );
}
