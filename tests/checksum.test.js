
import test from "node:test";
import assert from "node:assert/strict";

import {
  toChecksumAddress,
  isValidChecksumAddress
} from "../js/primitives/checksum.js";

test("EIP-55 matches a reference address", () => {
  const input =
    "0x52908400098527886e0f7030069857d2e4169ee7";

  const expected =
    "0x52908400098527886E0F7030069857D2E4169EE7";

  assert.equal(toChecksumAddress(input), expected);
});

test("EIP-55 matches another reference address", () => {
  const input =
    "0xde709f2102306220921060314715629080e2fb77";

  const expected =
    "0xde709f2102306220921060314715629080e2fb77";

  assert.equal(toChecksumAddress(input), expected);
});

test("EIP-55 checksum validation detects wrong case", () => {
  const valid =
    "0x52908400098527886E0F7030069857D2E4169EE7";

  const invalid =
    "0x52908400098527886e0F7030069857D2E4169EE7";

  assert.equal(isValidChecksumAddress(valid), true);
  assert.equal(isValidChecksumAddress(invalid), false);
});

test("EIP-55 rejects invalid address length", () => {
  assert.throws(
    () => toChecksumAddress("0x1234"),
    /Invalid Ethereum address/
  );
});
