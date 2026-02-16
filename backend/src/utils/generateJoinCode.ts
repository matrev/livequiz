import crypto from 'crypto';

/**
 * Generates a random 8-character alphanumeric case-sensitive string for quiz join codes.
 * Uses cryptographically secure random generation to ensure uniqueness.
 * 
 * @returns An 8-character alphanumeric string with both upper and lower case letters
 * 
 * @example
 * const code = generateJoinCode();
 * // Returns something like: "aB3xK9mL"
 */
export function generateJoinCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 8;
  let result = '';

  // Generate 8 random bytes for better entropy
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    result += characters.charAt(randomBytes[i] % characters.length);
  }

  return result;
}
