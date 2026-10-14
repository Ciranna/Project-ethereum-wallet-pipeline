
import { secp256k1 } from "@noble/curves/secp256k1.js";

export function derivePublicKey(privateKey) {
  if (!(privateKey instanceof Uint8Array)) {
    throw new TypeError(
      "Private key must be a Uint8Array"
    );
  }

  if (privateKey.length !== 32) {
    throw new RangeError(
      "Private key must contain 32 bytes"
    );
  }

  // Returns 65 bytes: 0x04 || X || Y
  const uncompressed = secp256k1.getPublicKey(
    privateKey,
    false
  );

  // Returns 33 bytes: 0x02/0x03 || X
  const compressed = secp256k1.getPublicKey(
    privateKey,
    true
  );

  // Ethereum hashes X || Y, without 0x04
  const ethereumPublicKey = uncompressed.slice(1);

  return {
    uncompressed,
    compressed,
    ethereumPublicKey,
    x: uncompressed.slice(1, 33),
    y: uncompressed.slice(33, 65)
  };
}
