
import { TEST_VECTOR } from "./config.js";

import { deriveMasterKey } from "./primitives/hdWallet.js";

import {
  mnemonicToSeed,
  bytesToHex
} from "./primitives/bip39.js";

import {
  displayMnemonic,
  displayMessage
} from "./ui.js";

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

      displayMessage(
        `BIP-39 Seed (${seed.length} bytes): ${seedHex}\n` +
        `Master Private Key: ${masterPrivateKeyHex}\n` +
        `Master Chain Code: ${masterChainCodeHex}`
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
