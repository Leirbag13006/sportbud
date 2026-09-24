/** Échappe le texte injecté dans le HTML des e-mails. */
function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

/**
 * E-mail « Réinitialise ton mot de passe ».
 * HTML simple en styles inline (les clients mail ignorent les feuilles de style) ;
 * les couleurs reprennent la charte : nuit #0a1a17, menthe #2fe0a0.
 */
export function passwordResetEmail({ firstName, url }: { firstName: string; url: string }) {
  const name = escapeHtml(firstName);
  const link = escapeHtml(url);

  return {
    subject: "Réinitialise ton mot de passe SportMates",
    text: `Salut ${firstName},

Tu as demandé à réinitialiser ton mot de passe SportMates. Ouvre ce lien pour en choisir un nouveau (valable 1 heure) :

${url}

Si tu n'es pas à l'origine de cette demande, ignore cet e-mail : ton mot de passe actuel reste valable.

L'équipe SportMates`,
    html: `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:24px;background:#f6f7f5;font-family:Arial,Helvetica,sans-serif;color:#0e1a18">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden">
      <tr>
        <td style="background:#0a1a17;padding:24px 28px;font-size:22px;font-weight:900;font-style:italic;color:#ffffff">
          Sport<span style="color:#2fe0a0">Mates</span>
        </td>
      </tr>
      <tr>
        <td style="padding:28px">
          <p style="margin:0 0 12px;font-size:18px;font-weight:bold">Salut ${name},</p>
          <p style="margin:0 0 24px;line-height:1.5">
            Tu as demandé à réinitialiser ton mot de passe. Clique sur le bouton ci-dessous pour en choisir un nouveau.
            Le lien est valable <strong>1 heure</strong>.
          </p>
          <p style="margin:0 0 24px">
            <a href="${link}" style="display:inline-block;background:#2fe0a0;color:#0a1a17;font-weight:bold;text-decoration:none;padding:12px 22px;border-radius:10px">
              Choisir un nouveau mot de passe
            </a>
          </p>
          <p style="margin:0;font-size:13px;line-height:1.5;color:#4a5754">
            Si tu n'es pas à l'origine de cette demande, ignore cet e-mail : ton mot de passe actuel reste valable.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
}
