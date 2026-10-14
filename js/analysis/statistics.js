
export function countSetBits(bytes) {
  if (!(bytes instanceof Uint8Array)) {
    throw new TypeError("Expected Uint8Array");
  }

  let count = 0;

  for (const byte of bytes) {
    let value = byte;

    while (value !== 0) {
      count += value & 1;
      value >>= 1;
    }
  }

  return count;
}

export function bitDistribution(bytes) {
  const totalBits = bytes.length * 8;

  if (totalBits === 0) {
    throw new RangeError("Input cannot be empty");
  }

  const ones = countSetBits(bytes);
  const zeros = totalBits - ones;

  return {
    totalBits,
    zeros,
    ones,
    zeroPercentage: (zeros / totalBits) * 100,
    onePercentage: (ones / totalBits) * 100
  };
}

export function hammingDistance(a, b) {
  if (!(a instanceof Uint8Array) ||
      !(b instanceof Uint8Array)) {
    throw new TypeError("Expected Uint8Array");
  }

  if (a.length !== b.length) {
    throw new RangeError(
      "Inputs must have the same length"
    );
  }

  let distance = 0;

  for (let i = 0; i < a.length; i++) {
    distance += countSetBits(
      new Uint8Array([a[i] ^ b[i]])
    );
  }

  return distance;
}
