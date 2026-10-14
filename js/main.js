
import { TEST_VECTOR, APP_CONFIG } from "./config.js";

import {
  displayExperimentalInterpretation
} from "./analysis/conclusions.js";

import {
  runAvalancheExperiment,
  runAvalancheAnalysis
} from "./analysis/avalanche.js";

import {
  displaySingleAvalanche,
  displayFullAvalanche
} from "./analysis/statisticsUI.js";


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



function initializeStatisticalExploration() {
  const inputElement = document.getElementById(
    "avalanche-input"
  );

  const bitIndexElement = document.getElementById(
    "avalanche-bit-index"
  );

  const errorElement = document.getElementById(
    "statistics-error"
  );

  const singleButton = document.getElementById(
    "run-single-avalanche"
  );

  const fullButton = document.getElementById(
    "run-full-avalanche"
  );

  const resetButton = document.getElementById(
    "reset-statistics"
  );

  const resultsElement = document.getElementById(
    "statistics-results"
  );

  const chartElement = document.getElementById(
    "statistics-chart"
  );

  const interpretationElement = document.getElementById(
    "experimental-interpretation"
  );

  const initialInput = inputElement.value;
  const initialBitIndex = bitIndexElement.value;

  let experimentState = "idle";

  function updateControls() {
    const isIdle = experimentState === "idle";
    const isCompleted = experimentState === "completed";

    inputElement.disabled = !isIdle;
    bitIndexElement.disabled = !isIdle;

    singleButton.disabled = !isIdle;
    fullButton.disabled = !isIdle;

    resetButton.disabled = !isCompleted;
  }

  function setExperimentState(newState) {
    experimentState = newState;
    updateControls();
  }

  function clearResults() {
    resultsElement.replaceChildren();
    chartElement.replaceChildren();
    interpretationElement.replaceChildren();
    interpretationElement.hidden = true;
    errorElement.textContent = "";
  }

  function readInput() {
    const text = inputElement.value;

    if (text.length === 0) {
      throw new Error("Please enter some text.");
    }

    const bytes = new TextEncoder().encode(text);

    if (bytes.length > 64) {
      throw new Error(
        "Maximum input length is 64 UTF-8 bytes."
      );
    }

    bitIndexElement.max = String(bytes.length * 8 - 1);

    return bytes;
  }

  singleButton.addEventListener("click", () => {
    if (experimentState !== "idle") return;

    try {
      clearResults();

      const bytes = readInput();
      const bitIndex = Number(bitIndexElement.value);

      // Validazione e calcolo prima di bloccare
      // definitivamente l'interfaccia.
      const result = runAvalancheExperiment(
        bytes,
        bitIndex
      );

      setExperimentState("running");

      displaySingleAvalanche(result);

      setExperimentState("completed");

    } catch (error) {
      clearResults();
      errorElement.textContent = error.message;
      setExperimentState("idle");
    }
  });

  fullButton.addEventListener("click", () => {
    if (experimentState !== "idle") return;

    try {
      clearResults();

      const bytes = readInput();

      setExperimentState("running");

      const analysis = runAvalancheAnalysis(bytes);

      displayFullAvalanche(analysis);
      displayExperimentalInterpretation(analysis);

      interpretationElement.hidden = false;

      setExperimentState("completed");

    } catch (error) {
      clearResults();
      errorElement.textContent = error.message;
      setExperimentState("idle");
    }
  });

  resetButton.addEventListener("click", () => {
    if (experimentState !== "completed") return;

    clearResults();

    inputElement.value = initialInput;
    bitIndexElement.value = initialBitIndex;
    bitIndexElement.max = String(
      new TextEncoder().encode(initialInput).length * 8 - 1
    );

    setExperimentState("idle");
  });

  updateControls();
}


initializeApplication();
initializeStatisticalExploration();

