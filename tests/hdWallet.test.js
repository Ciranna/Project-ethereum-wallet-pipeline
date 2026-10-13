
import test from "node:test";
import assert from "node:assert/strict";

import { TEST_VECTOR } from "../js/config.js";

import { mnemonicToSeed } from "../js/primitives/bip39.js";
import { deriveMasterKey } from "../js/primitives/hdWallet.js";

test("BIP-32 generates master key and chain code", async () => {
  const seed = await mnemonicToSeed(
    TEST_VECTOR.mnemonic,
    TEST_VECTOR.passphrase
  );

  const master = await deriveMasterKey(seed);

  assert.equal(master.privateKey.length, 32);
  assert.equal(master.chainCode.length, 32);
});

test("BIP-32 master derivation is deterministic", async () => {
  const seed = await mnemonicToSeed(
    TEST_VECTOR.mnemonic,
    TEST_VECTOR.passphrase
  );

  const first = await deriveMasterKey(seed);
  const second = await deriveMasterKey(seed);

  assert.deepEqual(first.privateKey, second.privateKey);
  assert.deepEqual(first.chainCode, second.chainCode);
});

test("BIP-32 rejects invalid seed lengths", async () => {
  await assert.rejects(
    deriveMasterKey(new Uint8Array(8)),
    RangeError
  );
});
