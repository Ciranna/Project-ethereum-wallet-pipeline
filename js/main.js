
import { TEST_VECTOR } from "./config.js";

import {
  displayMnemonic,
  displayMessage
} from "./ui.js";

function initializeApplication() {
  displayMnemonic(TEST_VECTOR.mnemonic);

  const button = document.getElementById("generate-seed");

  button.addEventListener("click", () => {
    displayMessage(
      "BIP-39 seed generation will be implemented " +
      "in the next lesson."
    );
  });
}

initializeApplication();
