import { z } from "zod";

import { REPORT_REASON_VALUES } from "@/db/schema";

/** Signalement d'un membre. */
export const reportSchema = z
  .object({
    reportedId: z.string().min(1),
    reason: z.enum(REPORT_REASON_VALUES, "Choisis un motif."),
    details: z
      .string()
      .trim()
      .max(1000, "1000 caractères maximum.")
      .transform((value) => value || null),
  })
  // « Autre » doit être expliqué.
  .refine((report) => report.reason !== "other" || (report.details?.length ?? 0) >= 10, {
    path: ["details"],
    message: "Décris la situation en quelques mots (10 caractères minimum).",
  });

export type ReportInput = z.input<typeof reportSchema>;
