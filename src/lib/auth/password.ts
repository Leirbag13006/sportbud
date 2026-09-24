import "server-only";

import bcrypt from "bcryptjs";

/** Coût bcrypt : ~100 ms par hachage, bon compromis sécurité / réactivité. */
const SALT_ROUNDS = 12;

export function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/**
 * Hash factice comparé quand l'email n'existe pas : la réponse prend le même temps
 * que pour un vrai compte, ce qui empêche de deviner quels emails sont inscrits.
 */
export const DUMMY_PASSWORD_HASH = "$2b$12$kyib4c4zJBviBCtQuV8sh.5.9oGIiUENmEi8DgUGcRL/HqZmzVXZ.";
