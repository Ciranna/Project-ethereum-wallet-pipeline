
import { keccak_256 } from "@noble/hashes/sha3.js";

export function hashPublicKey(publicKey) {
  if (!(publicKey instanceof Uint8Array)) {
    throw new TypeError(
      "Public key must be a Uint8Array"
    );
  }

  if (publicKey.length !== 64) {
    throw new RangeError(
      "Ethereum public key must contain 64 bytes"
    );
  }

  return keccak_256(publicKey);
}

export function publicKeyToAddress(publicKey) {
  const hash = hashPublicKey(publicKey);

  // Ethereum uses the last 20 bytes of Keccak-256.
  const addressBytes = hash.slice(-20);

  return {
    hash,
    addressBytes
  };
}
