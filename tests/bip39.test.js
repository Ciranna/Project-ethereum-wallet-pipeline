
import test from "node:test";
import assert from "node:assert/strict";

import { TEST_VECTOR } from "../js/config.js";

import {
  mnemonicToSeed,
  bytesToHex
} from "../js/primitives/bip39.js";

test("BIP-39 generates the official test seed", async () => {
  const seed = await mnemonicToSeed(
    TEST_VECTOR.mnemonic,
    TEST_VECTOR.passphrase
  );

  const expected =
    "c55257c360c07c72029aebc1b53c05ed" +
    "0362ada38ead3e3e9efa3708e5349553" +
    "1f09a6987599d18264c1e1c92f2cf141" +
    "630c7a3c4ab7c81b2f001698e7463b04";

  assert.equal(seed.length, 64);
  assert.equal(bytesToHex(seed), expected);
});

test("BIP-39 is deterministic", async () => {
  const seed1 = await mnemonicToSeed(
    TEST_VECTOR.mnemonic,
    TEST_VECTOR.passphrase
  );

  const seed2 = await mnemonicToSeed(
    TEST_VECTOR.mnemonic,
    TEST_VECTOR.passphrase
  );

  assert.deepEqual(seed1, seed2);
});

test("Changing the passphrase changes the seed", async () => {
  const seed1 = await mnemonicToSeed(
    TEST_VECTOR.mnemonic,
    "TREZOR"
  );

  const seed2 = await mnemonicToSeed(
    TEST_VECTOR.mnemonic,
    "different"
  );

  assert.notDeepEqual(seed1, seed2);
});
