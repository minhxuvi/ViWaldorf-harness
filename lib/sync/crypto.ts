/**
 * Web Crypto API client-side encryption for zero-knowledge sync.
 * Encrypts and decrypts WaldorfData using the user's secret Passkey.
 */

export class SyncCrypto {
  private static async deriveKey(passkey: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(passkey),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt as any,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  public static async encrypt(plainJson: string, passkey: string): Promise<string> {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKey(passkey, salt);

    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv as any },
      key,
      encoder.encode(plainJson) as any
    );

    const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

    return this.bytesToBase64(combined);
  }

  public static async decrypt(encryptedBase64: string, passkey: string): Promise<string> {
    const combined = this.base64ToBytes(encryptedBase64);
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const ciphertext = combined.slice(28);

    const key = await this.deriveKey(passkey, salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as any },
      key,
      ciphertext as any
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  public static async hashPasskey(passkey: string): Promise<string> {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(passkey));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  private static bytesToBase64(bytes: Uint8Array): string {
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private static base64ToBytes(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
