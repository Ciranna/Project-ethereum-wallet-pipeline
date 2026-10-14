
export function displayMnemonic(mnemonic) {
  const input = document.getElementById("mnemonic");
  input.value = mnemonic;
}

export function displayMessage(message) {
  const results = document.getElementById("results");

  const paragraph = document.createElement("p");
  paragraph.textContent = message;

  results.replaceChildren(paragraph);
}

function createResultField(label, value) {
  const field = document.createElement("div");
  field.className = "result-field";

  const heading = document.createElement("div");
  heading.className = "result-label";
  heading.textContent = label;

  const valueRow = document.createElement("div");
  valueRow.className = "result-value-row";

  const valueElement = document.createElement("code");
  valueElement.className = "result-value";
  valueElement.textContent = String(value);

  const copyButton = document.createElement("button");
  copyButton.className = "copy-button";
  copyButton.type = "button";
  copyButton.textContent = "Copy";

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(String(value));
      copyButton.textContent = "Copied!";
    } catch {
      copyButton.textContent = "Copy failed";
    }
  });

  valueRow.append(valueElement, copyButton);
  field.append(heading, valueRow);

  return field;
}

function createStage(title, description, fields) {
  const stage = document.createElement("article");
  stage.className = "result-stage";

  const heading = document.createElement("h3");
  heading.textContent = title;

  const paragraph = document.createElement("p");
  paragraph.className = "stage-description";
  paragraph.textContent = description;

  stage.append(heading, paragraph);

  for (const [label, value] of fields) {
    stage.append(createResultField(label, value));
  }

  return stage;
}

export function displayPipelineResults(data) {
  const results = document.getElementById("results");

  const fragment = document.createDocumentFragment();

  fragment.append(
    createStage(
      "BIP-39 — Seed Generation",
      "PBKDF2-HMAC-SHA512 derives a 64-byte seed.",
      [
        ["Seed (64 bytes)", data.seed]
      ]
    )
  );

  fragment.append(
    createStage(
      "BIP-32 / BIP-44 — Key Derivation",
      "Hierarchical deterministic wallet derivation.",
      [
        ["Master Private Key", data.masterPrivateKey],
        ["Master Chain Code", data.masterChainCode],
        ["Derivation Path", data.derivationPath],
        ["Ethereum Private Key", data.ethereumPrivateKey]
      ]
    )
  );

  fragment.append(
    createStage(
      "secp256k1 — Public Key",
      "Elliptic-curve scalar multiplication: Q = kG.",
      [
        ["Compressed Public Key", data.compressedPublicKey],
        ["Uncompressed Public Key", data.uncompressedPublicKey],
        ["Ethereum Public Key (64 bytes)", data.ethereumPublicKey]
      ]
    )
  );

  fragment.append(
    createStage(
      "Keccak-256 — Ethereum Address",
      "Hash the 64-byte public key and take the last 20 bytes.",
      [
        ["Keccak-256 Hash", data.keccakHash],
        ["Ethereum Address", data.ethereumAddress]
      ]
    )
  );

  fragment.append(
    createStage(
      "EIP-55 — Address Checksum",
      "Mixed-case encoding for detecting address transcription errors.",
      [
        ["Checksummed Address", data.checksummedAddress],
        ["Checksum Valid", data.checksumValid ? "Yes" : "No"]
      ]
    )
  );

  results.replaceChildren(fragment);
}


export function displayStepResults(stepNumber, fields) {
  const container = document.getElementById(
    `results-step-${stepNumber}`
  );

  const fragment = document.createDocumentFragment();

  for (const [label, value] of fields) {
    const field = document.createElement("div");
    field.className = "result-field";

    const heading = document.createElement("div");
    heading.className = "result-label";
    heading.textContent = label;

    const valueRow = document.createElement("div");
    valueRow.className = "result-value-row";

    const code = document.createElement("code");
    code.className = "result-value";
    code.textContent = String(value);

    const copyButton = document.createElement("button");
    copyButton.className = "copy-button";
    copyButton.type = "button";
    copyButton.textContent = "Copy";

    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(String(value));
        copyButton.textContent = "Copied!";
      } catch {
        copyButton.textContent = "Copy failed";
      }
    });

    valueRow.append(code, copyButton);
    field.append(heading, valueRow);
    fragment.append(field);
  }

  container.replaceChildren(fragment);
}

export function updatePipelineProgress(completedSteps) {
  const percentage = (completedSteps / 5) * 100;

  document.getElementById("progress-bar").style.width =
    `${percentage}%`;

  document.getElementById("progress-label").textContent =
    `${completedSteps} / 5 completed`;

  for (let step = 1; step <= 5; step++) {
    const article = document.getElementById(`step-${step}`);
    const button = document.getElementById(`run-step-${step}`);
    const status = article.querySelector(".step-status");

    article.classList.remove("locked", "completed");

    if (step <= completedSteps) {
      article.classList.add("completed");
      status.textContent = "Completed";
      button.disabled = true;
    } else if (step === completedSteps + 1) {
      status.textContent = "Ready";
      button.disabled = false;
    } else {
      article.classList.add("locked");
      status.textContent = "Locked";
      button.disabled = true;
    }
  }
}

export function clearPipelineResults() {
  for (let step = 1; step <= 5; step++) {
    document.getElementById(
      `results-step-${step}`
    ).replaceChildren();
  }

  document.getElementById("pipeline-error").textContent = "";

  updatePipelineProgress(0);
}

