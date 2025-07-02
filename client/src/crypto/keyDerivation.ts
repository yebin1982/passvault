import argon2 from 'argon2-browser';

/**
 * Derives a key from a password and salt using Argon2id.
 * This is a computationally expensive process designed to resist brute-force attacks.
 *
 * @param password The user's master password.
 * @param salt A unique salt for the user.
 * @returns A derived key as a hex string.
 */
export async function deriveKey(
  password: string,
  salt: string,
): Promise<string> {
  const result = await argon2.hash({
    pass: password,
    salt: salt,
    time: 1, // Iterations
    mem: 1024 * 64, // 64 MB memory
    hashLen: 32, // 32-byte hash
    parallelism: 4,
    type: argon2.ArgonType.Argon2id,
  });

  return result.hashHex;
}

/**
 * Generates a cryptographically secure random salt.
 * @returns A salt as a hex string.
 */
export function generateSalt(): string {
  const salt = new Uint8Array(16);
  window.crypto.getRandomValues(salt);
  // Convert byte array to hex string
  return Array.from(salt)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}