
import { TEST_VECTOR } from "./config.js";

import { deriveMasterKey } from "./primitives/hdWallet.js";

import { derivePublicKey } from "./primitives/ellipticCurve.js";

import { publicKeyToAddress } from "./primitives/keccak.js";

import {
  toChecksumAddress,
  isValidChecksumAddress
} from "./primitives/checksum.js";

import {
  mnemonicToSeed,
  bytesToHex
} from "./primitives/bip39.js";

import {
  displayMnemonic,
  displayMessage
} from "./ui.js";

import { APP_CONFIG } from "./config.js";
import { deriveEthereumKey } from "./primitives/hdWallet.js";

function initializeApplication() {
  displayMnemonic(TEST_VECTOR.mnemonic);

  const button = document.getElementById("generate-seed");

  button.addEventListener("click", async () => {
    button.disabled = true;

    try {
      const seed = await mnemonicToSeed(
        TEST_VECTOR.mnemonic,
        TEST_VECTOR.passphrase
      );

        const seedHex = bytesToHex(seed);

        const master = await deriveMasterKey(seed);

        const masterPrivateKeyHex = bytesToHex(
        master.privateKey
        );

        const masterChainCodeHex = bytesToHex(
        master.chainCode
        );

        const ethereumKey = deriveEthereumKey(
        seed,
        APP_CONFIG.derivationPath
        );

        const ethereumPrivateKeyHex = bytesToHex(
        ethereumKey.privateKey
        );

        const publicKey = derivePublicKey(
        ethereumKey.privateKey
        );

        const publicKeyCompressedHex = bytesToHex(
        publicKey.compressed
        );

        const publicKeyUncompressedHex = bytesToHex(
        publicKey.uncompressed
        );

        const ethereumPublicKeyHex = bytesToHex(
        publicKey.ethereumPublicKey
        );

        const addressResult = publicKeyToAddress(
        publicKey.ethereumPublicKey
        );

        const keccakHashHex = bytesToHex(
        addressResult.hash
        );

        const ethereumAddressHex =
        "0x" + bytesToHex(addressResult.addressBytes);

        const checksummedAddress = toChecksumAddress(
        ethereumAddressHex
        );

        const checksumValid = isValidChecksumAddress(
        checksummedAddress
        );

        displayMessage(
            `BIP-39 Seed (${seed.length} bytes): ${seedHex}\n` +
            `Master Private Key: ${masterPrivateKeyHex}\n` +
            `Master Chain Code: ${masterChainCodeHex}\n` +
            `Derivation Path: ${ethereumKey.path}\n` +
            `Ethereum Private Key: ${ethereumPrivateKeyHex}` +
            `Public Key (Compressed): ${publicKeyCompressedHex}\n` +
            `Public Key (Uncompressed): ${publicKeyUncompressedHex}\n` +
            `Ethereum Public Key (64 bytes): ${ethereumPublicKeyHex}` +
            `Keccak-256 Hash: ${keccakHashHex}\n` +
            `Ethereum Address: ${ethereumAddressHex}` +
            `Checksummed Address (EIP-55): ${checksummedAddress}\n` +
            `Checksum Valid: ${checksumValid}`
        );
    } catch (error) {
      console.error(error);
      displayMessage("Error generating BIP-39 seed.");
    } finally {
      button.disabled = false;
    }
  });
}

initializeApplication();
