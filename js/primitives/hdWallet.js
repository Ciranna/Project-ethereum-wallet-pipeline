
const encoder = new TextEncoder();

const SECP256K1_ORDER = BigInt(
  "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE" +
  "BAAEDCE6AF48A03BBFD25E8CD0364141"
);

function bytesToBigInt(bytes) {
  const hex = Array.from(
    bytes,
    byte => byte.toString(16).padStart(2, "0")
  ).join("");

  return BigInt("0x" + hex);
}

export async function deriveMasterKey(seed) {
  if (!(seed instanceof Uint8Array)) {
    throw new TypeError("Seed must be a Uint8Array");
  }

  if (seed.length < 16 || seed.length > 64) {
    throw new RangeError(
      "BIP-32 seed must contain 16 to 64 bytes"
    );
  }

  const hmacKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode("Bitcoin seed"),
    {
      name: "HMAC",
      hash: "SHA-512"
    },
    false,
    ["sign"]
  );

  const result = await crypto.subtle.sign(
    "HMAC",
    hmacKey,
    seed
  );

  const output = new Uint8Array(result);

  const privateKey = output.slice(0, 32);
  const chainCode = output.slice(32, 64);

  const privateKeyInteger = bytesToBigInt(privateKey);

  if (
    privateKeyInteger === 0n ||
    privateKeyInteger >= SECP256K1_ORDER
  ) {
    throw new Error("Invalid BIP-32 master private key");
  }

  return {
    privateKey,
    chainCode
  };
}
