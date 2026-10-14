
import test from "node:test";
import assert from "node:assert/strict";

import { TEST_VECTOR } from "../js/config.js";
import { mnemonicToSeed } from "../js/primitives/bip39.js";
import { deriveEthereumKey } from "../js/primitives/hdWallet.js";
import { derivePublicKey } from "../js/primitives/ellipticCurve.js";

test("secp256k1 generates correct public key lengths", async () => {
  const seed = await mnemonicToSeed(
    TEST_VECTOR.mnemonic,
    TEST_VECTOR.passphrase
  );

  const wallet = deriveEthereumKey(
    seed,
    "m/44'/60'/0'/0/0"
  );

  const publicKey = derivePublicKey(wallet.privateKey);

  assert.equal(publicKey.uncompressed.length, 65);
  assert.equal(publicKey.compressed.length, 33);
  assert.equal(publicKey.ethereumPublicKey.length, 64);
  assert.equal(publicKey.x.length, 32);
  assert.equal(publicKey.y.length, 32);
});

test("secp256k1 matches BIP-32 public key", async () => {
  const seed = await mnemonicToSeed(
    TEST_VECTOR.mnemonic,
    TEST_VECTOR.passphrase
  );

  const wallet = deriveEthereumKey(
    seed,
    "m/44'/60'/0'/0/0"
  );

  const publicKey = derivePublicKey(wallet.privateKey);

  assert.deepEqual(
    publicKey.compressed,
    wallet.publicKey
  );
});

test("secp256k1 rejects invalid private key length", () => {
  assert.throws(
    () => derivePublicKey(new Uint8Array(16)),
    RangeError
  );
});
