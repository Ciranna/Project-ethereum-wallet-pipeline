
import test from "node:test";
import assert from "node:assert/strict";

import { TEST_VECTOR } from "../js/config.js";

import { mnemonicToSeed } from "../js/primitives/bip39.js";
import { deriveMasterKey } from "../js/primitives/hdWallet.js";

import { HDKey } from "@scure/bip32";
import { bytesToHex } from "../js/primitives/bip39.js";
import { deriveEthereumKey } from "../js/primitives/hdWallet.js";

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


test("Our master key matches the BIP-32 library", async () => {
  const seed = await mnemonicToSeed(
    TEST_VECTOR.mnemonic,
    TEST_VECTOR.passphrase
  );

  const ourMaster = await deriveMasterKey(seed);
  const libraryMaster = HDKey.fromMasterSeed(seed);

  assert.equal(
    bytesToHex(ourMaster.privateKey),
    bytesToHex(libraryMaster.privateKey)
  );

  assert.equal(
    bytesToHex(ourMaster.chainCode),
    bytesToHex(libraryMaster.chainCode)
  );
});

test("BIP-44 derives the Ethereum account key", async () => {
  const seed = await mnemonicToSeed(
    TEST_VECTOR.mnemonic,
    TEST_VECTOR.passphrase
  );

  const path = "m/44'/60'/0'/0/0";

  const result = deriveEthereumKey(seed, path);

  assert.equal(result.path, path);
  assert.equal(result.privateKey.length, 32);
  assert.equal(result.chainCode.length, 32);
  assert.equal(result.publicKey.length, 33);
});

test("Different address indices produce different keys", async () => {
  const seed = await mnemonicToSeed(
    TEST_VECTOR.mnemonic,
    TEST_VECTOR.passphrase
  );

  const first = deriveEthereumKey(
    seed,
    "m/44'/60'/0'/0/0"
  );

  const second = deriveEthereumKey(
    seed,
    "m/44'/60'/0'/0/1"
  );

  assert.notDeepEqual(first.privateKey, second.privateKey);
});

