// On-device encryption helpers for PersonalPocket.
// - PIN is stretched with PBKDF2 (SHA-256) into a 256-bit key.
// - All vault records are stored AES-encrypted with that key.
// - A SHA-256 verifier lets us validate a PIN without decrypting the vault.
// Randomness comes from expo-crypto (CSPRNG); AES/PBKDF2 from crypto-js.

import CryptoJS from "crypto-js";
import * as Crypto from "expo-crypto";

const PBKDF2_ITERATIONS = 15000;
const KEY_SIZE_WORDS = 256 / 32;

export async function randomHex(byteLength = 16): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(byteLength);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function deriveKey(pin: string, saltHex: string): string {
  const salt = CryptoJS.enc.Hex.parse(saltHex);
  const key = CryptoJS.PBKDF2(pin, salt, {
    keySize: KEY_SIZE_WORDS,
    iterations: PBKDF2_ITERATIONS,
    hasher: CryptoJS.algo.SHA256,
  });
  return key.toString(CryptoJS.enc.Hex);
}

export function sha256(value: string): string {
  return CryptoJS.SHA256(value).toString(CryptoJS.enc.Hex);
}

export function encryptString(plaintext: string, keyHex: string): string {
  return CryptoJS.AES.encrypt(plaintext, keyHex).toString();
}

export function decryptString(ciphertext: string, keyHex: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, keyHex);
  return bytes.toString(CryptoJS.enc.Utf8);
}
