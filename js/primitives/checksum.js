
import { keccak_256 } from "@noble/hashes/sha3.js";

const encoder = new TextEncoder();

export function toChecksumAddress(address) {
  if (typeof address !== "string") {
    throw new TypeError("Address must be a string");
  }

  const normalized = address
    .replace(/^0x/i, "")
    .toLowerCase();

  if (!/^[0-9a-f]{40}$/.test(normalized)) {
    throw new Error("Invalid Ethereum address");
  }

  // Hash the ASCII characters, not the 20 address bytes.
  const hash = keccak_256(
    encoder.encode(normalized)
  );

  let checksummed = "0x";

  for (let i = 0; i < normalized.length; i++) {
    const character = normalized[i];

    // Each hash byte contains two hexadecimal nibbles.
    const byte = hash[Math.floor(i / 2)];

    const nibble = i % 2 === 0
      ? byte >> 4
      : byte & 0x0f;

    checksummed += nibble >= 8
      ? character.toUpperCase()
      : character;
  }

  return checksummed;
}

export function isValidChecksumAddress(address) {
  if (typeof address !== "string") {
    return false;
  }

  try {
    return address === toChecksumAddress(address);
  } catch {
    return false;
  }
}
