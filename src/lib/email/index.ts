import "server-only";

import nodemailer from "nodemailer";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Envoi d'e-mails transactionnels par SMTP (ex. Gmail avec un mot de passe d'application).
 * Variables : SMTP_HOST, SMTP_PORT (465 par défaut), SMTP_USER, SMTP_PASSWORD, EMAIL_FROM (facultatif).
 *
 * Sans configuration SMTP, le message est écrit dans les journaux du serveur :
 * pratique en développement, et l'équipe peut retrouver un lien depuis les logs Vercel.
 */
export async function sendEmail(message: EmailMessage) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    console.info(`[email] SMTP non configuré — message pour ${message.to} : « ${message.subject} »\n${message.text}`);
    return;
  }

  const port = Number(SMTP_PORT ?? 465);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });

  await transporter.sendMail({ from: EMAIL_FROM ?? `SportMates <${SMTP_USER}>`, ...message });
}
