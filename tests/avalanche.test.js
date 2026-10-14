
import test from "node:test";
import assert from "node:assert/strict";

import {
  runAvalancheExperiment,
  runAvalancheAnalysis
} from "../js/analysis/avalanche.js";

test("Avalanche experiment flips exactly one input bit", () => {
  const input = new Uint8Array([0b10110110]);

  const result = runAvalancheExperiment(input, 7);

  assert.equal(result.inputChangedBits, 1);

  assert.equal(
    result.modifiedInput[0],
    0b10110111
  );
});

test("Avalanche experiment produces 256-bit hashes", () => {
  const input = new TextEncoder().encode(
    "Ethereum"
  );

  const result = runAvalancheExperiment(input, 0);

  assert.equal(result.originalHash.length, 32);
  assert.equal(result.modifiedHash.length, 32);
  assert.equal(result.totalOutputBits, 256);
});

test("Avalanche percentage matches Hamming distance", () => {
  const input = new TextEncoder().encode(
    "Cryptography"
  );

  const result = runAvalancheExperiment(input, 3);

  assert.equal(
    result.avalanchePercentage,
    (result.changedBits / 256) * 100
  );
});

test("Avalanche experiment does not modify original input", () => {
  const input = new Uint8Array([42]);

  runAvalancheExperiment(input, 0);

  assert.equal(input[0], 42);
});

test("Avalanche experiment rejects invalid bit index", () => {
  const input = new Uint8Array([42]);

  assert.throws(
    () => runAvalancheExperiment(input, 8),
    RangeError
  );
});


test("Avalanche analysis tests every input bit", () => {
  const input = new TextEncoder().encode("Ethereum");

  const result = runAvalancheAnalysis(input);

  assert.equal(result.totalExperiments, 64);
  assert.equal(result.experiments.length, 64);
});

test("Avalanche analysis calculates valid statistics", () => {
  const input = new TextEncoder().encode("Ethereum");

  const result = runAvalancheAnalysis(input);

  assert.ok(result.minimumChangedBits >= 0);
  assert.ok(result.maximumChangedBits <= 256);

  assert.ok(
    result.averageChangedBits >= result.minimumChangedBits
  );

  assert.ok(
    result.averageChangedBits <= result.maximumChangedBits
  );

  assert.equal(
    result.averageAvalanchePercentage,
    (result.averageChangedBits / 256) * 100
  );
});

test("Avalanche analysis preserves the original input", () => {
  const input = new TextEncoder().encode("Ethereum");
  const original = input.slice();

  runAvalancheAnalysis(input);

  assert.deepEqual(input, original);
});

