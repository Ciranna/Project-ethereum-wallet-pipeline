
import test from "node:test";
import assert from "node:assert/strict";

import {
  countSetBits,
  bitDistribution,
  hammingDistance
} from "../js/analysis/statistics.js";

test("Counts set bits correctly", () => {
  const bytes = new Uint8Array([0b10110110]);

  assert.equal(countSetBits(bytes), 5);
});

test("Calculates bit distribution", () => {
  const bytes = new Uint8Array([0b11110000]);

  const result = bitDistribution(bytes);

  assert.equal(result.zeros, 4);
  assert.equal(result.ones, 4);
  assert.equal(result.zeroPercentage, 50);
  assert.equal(result.onePercentage, 50);
});

test("Calculates Hamming distance", () => {
  const a = new Uint8Array([0b10110110]);
  const b = new Uint8Array([0b10011100]);

  assert.equal(hammingDistance(a, b), 3);
});

test("Identical inputs have Hamming distance zero", () => {
  const a = new Uint8Array([0b10101010]);

  assert.equal(hammingDistance(a, a), 0);
});

test("Rejects different input lengths", () => {
  const a = new Uint8Array([1]);
  const b = new Uint8Array([1, 2]);

  assert.throws(
    () => hammingDistance(a, b),
    RangeError
  );
});
