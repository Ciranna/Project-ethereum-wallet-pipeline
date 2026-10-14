
export function displayExperimentalInterpretation(analysis) {
  const container = document.getElementById(
    "experimental-interpretation"
  );

  const {
    totalExperiments,
    averageChangedBits,
    averageAvalanchePercentage,
    minimumChangedBits,
    maximumChangedBits
  } = analysis;

  const deviation = Math.abs(
    averageAvalanchePercentage - 50
  );

  const heading = document.createElement("h3");
  heading.textContent = "Experimental Interpretation";

  const summary = document.createElement("p");
  summary.textContent =
    `The experiment analyzed ${totalExperiments} ` +
    `single-bit input modifications. ` +
    `On average, ${averageChangedBits.toFixed(2)} ` +
    `out of 256 hash bits changed ` +
    `(${averageAvalanchePercentage.toFixed(2)}%).`;

  const expected = document.createElement("p");
  expected.textContent =
    `The theoretical expectation for an ideal hash ` +
    `is 128 changed bits (50%). ` +
    `The observed average differs from this ` +
    `reference by ${deviation.toFixed(2)} ` +
    `percentage points.`;

  const range = document.createElement("p");
  range.textContent =
    `The observed Hamming distances ranged from ` +
    `${minimumChangedBits} to ${maximumChangedBits} bits.`;

  const limitationHeading = document.createElement("h3");
  limitationHeading.textContent = "Limitations";

  const limitation = document.createElement("p");
  limitation.textContent =
    "This experiment evaluates the avalanche effect " +
    "for one selected input. It does not establish " +
    "collision resistance, preimage resistance, " +
    "or the overall cryptographic security " +
    "of Keccak-256.";

  container.replaceChildren(
    heading,
    summary,
    expected,
    range,
    limitationHeading,
    limitation
  );
}
