
import { keccak_256 } from "@noble/hashes/sha3.js";

import {
  hammingDistance,
  bitDistribution
} from "./statistics.js";

export function runAvalancheExperiment(
  input,
  bitIndex = 0
) {
  if (!(input instanceof Uint8Array)) {
    throw new TypeError("Input must be Uint8Array");
  }

  if (input.length === 0) {
    throw new RangeError("Input cannot be empty");
  }

  const totalInputBits = input.length * 8;

  if (
    !Number.isInteger(bitIndex) ||
    bitIndex < 0 ||
    bitIndex >= totalInputBits
  ) {
    throw new RangeError("Invalid bit index");
  }

  // Copy the original input.
  const modifiedInput = input.slice();

  // Find the byte containing the selected bit.
  const byteIndex = Math.floor(bitIndex / 8);

  // Bit 0 means the most significant bit of byte 0.
  const bitPosition = 7 - (bitIndex % 8);

  // Flip exactly one bit using XOR.
  modifiedInput[byteIndex] ^= 1 << bitPosition;

  const originalHash = keccak_256(input);
  const modifiedHash = keccak_256(modifiedInput);

  const changedBits = hammingDistance(
    originalHash,
    modifiedHash
  );

  const totalOutputBits = originalHash.length * 8;

  return {
    originalInput: input.slice(),
    modifiedInput,
    originalHash,
    modifiedHash,
    inputChangedBits: hammingDistance(
      input,
      modifiedInput
    ),
    changedBits,
    totalOutputBits,
    avalanchePercentage:
      (changedBits / totalOutputBits) * 100,
    originalDistribution:
      bitDistribution(originalHash),
    modifiedDistribution:
      bitDistribution(modifiedHash)
  };
}


export function runAvalancheAnalysis(input) {
  if (!(input instanceof Uint8Array)) {
    throw new TypeError("Input must be Uint8Array");
  }

  if (input.length === 0) {
    throw new RangeError("Input cannot be empty");
  }

  const totalInputBits = input.length * 8;
  const experiments = [];

  for (let bitIndex = 0; bitIndex < totalInputBits; bitIndex++) {
    const result = runAvalancheExperiment(
      input,
      bitIndex
    );

    experiments.push({
      bitIndex,
      changedBits: result.changedBits,
      avalanchePercentage: result.avalanchePercentage
    });
  }

  const distances = experiments.map(
    experiment => experiment.changedBits
  );

  const sum = distances.reduce(
    (total, value) => total + value,
    0
  );

  const average = sum / distances.length;

  return {
    totalExperiments: experiments.length,
    experiments,
    averageChangedBits: average,
    averageAvalanchePercentage: (average / 256) * 100,
    minimumChangedBits: Math.min(...distances),
    maximumChangedBits: Math.max(...distances)
  };
}

