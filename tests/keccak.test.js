
import test from "node:test";
import assert from "node:assert/strict";

import { keccak_256 } from "@noble/hashes/sha3.js";

import { bytesToHex } from "../js/primitives/bip39.js";
import { derivePublicKey } from "../js/primitives/ellipticCurve.js";

import {
  hashPublicKey,
  publicKeyToAddress
} from "../js/primitives/keccak.js";

test("Keccak-256 matches the known empty-input hash", () => {
  const digest = keccak_256(new Uint8Array());

  assert.equal(
    bytesToHex(digest),
    "c5d2460186f7233c927e7db2dcc703c0" +
    "e500b653ca82273b7bfad8045d85a470"
  );
});

test("Keccak-256 produces a 32-byte digest", () => {
  const privateKey = new Uint8Array(32);
  privateKey[31] = 1;

  const publicKey = derivePublicKey(privateKey);
  const hash = hashPublicKey(publicKey.ethereumPublicKey);

  assert.equal(hash.length, 32);
});

test("Private key 1 produces the known Ethereum address", () => {
  const privateKey = new Uint8Array(32);
  privateKey[31] = 1;

  const publicKey = derivePublicKey(privateKey);

  const result = publicKeyToAddress(
    publicKey.ethereumPublicKey
  );

  assert.equal(result.addressBytes.length, 20);

  assert.equal(
    bytesToHex(result.addressBytes),
    "7e5f4552091a69125d5dfcb7b8c2659029395bdf"
  );
});

test("Rejects public keys with incorrect length", () => {
  assert.throws(
    () => hashPublicKey(new Uint8Array(33)),
    RangeError
  );
});
