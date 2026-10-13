
import { TEST_VECTOR } from "./config.js";

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

      displayMessage(
        `BIP-39 Seed (${seed.length} bytes): ${seedHex}`
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
