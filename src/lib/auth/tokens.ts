import "server-only";

import { createHash, randomBytes } from "node:crypto";

/** Jeton aléatoire (256 bits) transmis à l'utilisateur (cookie de session, lien par e-mail). */
export function generateToken() {
  return randomBytes(32).toString("base64url");
}

/** Identifiant stocké en base = hash du jeton : une fuite de la base ne permet pas de l'utiliser. */
export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
