
import { TEST_VECTOR, APP_CONFIG } from "./config.js";

import {
  mnemonicToSeed,
  bytesToHex
} from "./primitives/bip39.js";

import {
  deriveMasterKey,
  deriveEthereumKey
} from "./primitives/hdWallet.js";

import { derivePublicKey } from "./primitives/ellipticCurve.js";
import { publicKeyToAddress } from "./primitives/keccak.js";

import {
  toChecksumAddress,
  isValidChecksumAddress
} from "./primitives/checksum.js";

import {
  displayMnemonic,
  displayStepResults,
  updatePipelineProgress,
  clearPipelineResults
} from "./ui.js";

// Stato della pipeline
const walletState = {
  seed: null,
  master: null,
  ethereumKey: null,
  publicKey: null,
  addressResult: null,
  ethereumAddress: null,
  checksummedAddress: null
};

let completedSteps = 0;
let isRunning = false;

async function executeStep(stepNumber) {
  // Le fasi devono essere eseguite in ordine.
  if (isRunning || stepNumber !== completedSteps + 1) {
    return;
  }

  isRunning = true;

  const button = document.getElementById(
    `run-step-${stepNumber}`
  );

  button.disabled = true;

  document.getElementById("pipeline-error").textContent = "";

  try {
    switch (stepNumber) {
      case 1: {
        walletState.seed = await mnemonicToSeed(
          TEST_VECTOR.mnemonic,
          TEST_VECTOR.passphrase
        );

        displayStepResults(1, [
          ["BIP-39 Seed (64 bytes)", bytesToHex(walletState.seed)]
        ]);

        break;
      }

      case 2: {
        walletState.master = await deriveMasterKey(
          walletState.seed
        );

        walletState.ethereumKey = deriveEthereumKey(
          walletState.seed,
          APP_CONFIG.derivationPath
        );

        displayStepResults(2, [
          [
            "Master Private Key",
            bytesToHex(walletState.master.privateKey)
          ],
          [
            "Master Chain Code",
            bytesToHex(walletState.master.chainCode)
          ],
          [
            "Derivation Path",
            walletState.ethereumKey.path
          ],
          [
            "Ethereum Private Key",
            bytesToHex(walletState.ethereumKey.privateKey)
          ]
        ]);

        break;
      }

      case 3: {
        walletState.publicKey = derivePublicKey(
          walletState.ethereumKey.privateKey
        );

        displayStepResults(3, [
          [
            "Compressed Public Key",
            bytesToHex(walletState.publicKey.compressed)
          ],
          [
            "Uncompressed Public Key",
            bytesToHex(walletState.publicKey.uncompressed)
          ],
          [
            "Ethereum Public Key (64 bytes)",
            bytesToHex(walletState.publicKey.ethereumPublicKey)
          ]
        ]);

        break;
      }

      case 4: {
        walletState.addressResult = publicKeyToAddress(
          walletState.publicKey.ethereumPublicKey
        );

        walletState.ethereumAddress =
          "0x" + bytesToHex(
            walletState.addressResult.addressBytes
          );

        displayStepResults(4, [
          [
            "Keccak-256 Hash",
            bytesToHex(walletState.addressResult.hash)
          ],
          [
            "Ethereum Address",
            walletState.ethereumAddress
          ]
        ]);

        break;
      }

      case 5: {
        walletState.checksummedAddress = toChecksumAddress(
          walletState.ethereumAddress
        );

        const valid = isValidChecksumAddress(
          walletState.checksummedAddress
        );

        displayStepResults(5, [
          [
            "Checksummed Address",
            walletState.checksummedAddress
          ],
          [
            "Checksum Valid",
            valid ? "Yes" : "No"
          ]
        ]);

        break;
      }

      default:
        throw new RangeError("Invalid pipeline step");
    }

    completedSteps = stepNumber;
    updatePipelineProgress(completedSteps);

  } catch (error) {
    console.error(error);

    document.getElementById("pipeline-error").textContent =
      `Error during step ${stepNumber}: ${error.message}`;

    updatePipelineProgress(completedSteps);

  } finally {
    isRunning = false;
  }
}

async function runAllSteps() {
  const button = document.getElementById("run-all");
  button.disabled = true;

  try {
    while (completedSteps < 5) {
      const nextStep = completedSteps + 1;

      await executeStep(nextStep);

      // Se una fase fallisce, interrompiamo.
      if (completedSteps < nextStep) {
        break;
      }
    }
  } finally {
    button.disabled = false;
  }
}

function resetPipeline() {
  if (isRunning) {
    return;
  }

  for (const key of Object.keys(walletState)) {
    walletState[key] = null;
  }

  completedSteps = 0;
  clearPipelineResults();
}

function initializeApplication() {
  displayMnemonic(TEST_VECTOR.mnemonic);
  updatePipelineProgress(0);

  for (let step = 1; step <= 5; step++) {
    document.getElementById(
      `run-step-${step}`
    ).addEventListener("click", () => {
      executeStep(step);
    });
  }

  document.getElementById("run-all")
    .addEventListener("click", runAllSteps);

  document.getElementById("reset-pipeline")
    .addEventListener("click", resetPipeline);
}

initializeApplication();
