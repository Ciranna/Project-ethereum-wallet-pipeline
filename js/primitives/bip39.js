
const encoder = new TextEncoder();

export async function mnemonicToSeed(
  mnemonic,
  passphrase = ""
) {
  const normalizedMnemonic = mnemonic.normalize("NFKD");
  const normalizedPassphrase = passphrase.normalize("NFKD");

  const passwordBytes = encoder.encode(normalizedMnemonic);
  const saltBytes = encoder.encode(
    "mnemonic" + normalizedPassphrase
  );

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBytes,
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const seedBuffer = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: 2048,
      hash: "SHA-512"
    },
    keyMaterial,
    512
  );

  return new Uint8Array(seedBuffer);
}

export function bytesToHex(bytes) {
  return Array.from(bytes, byte =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}
