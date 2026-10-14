
function createMetric(label, value) {
  const card = document.createElement("div");
  card.className = "stat-metric";

  const heading = document.createElement("span");
  heading.textContent = label;

  const number = document.createElement("strong");
  number.textContent = String(value);

  card.append(heading, number);

  return card;
}

export function displaySingleAvalanche(result) {
  const container = document.getElementById(
    "statistics-results"
  );

  const metrics = document.createElement("div");
  metrics.className = "statistics-metrics";

  metrics.append(
    createMetric(
      "Input bits changed",
      result.inputChangedBits
    ),
    createMetric(
      "Hash bits changed",
      `${result.changedBits} / 256`
    ),
    createMetric(
      "Avalanche effect",
      `${result.avalanchePercentage.toFixed(2)}%`
    ),
    createMetric(
      "Expected percentage",
      "50%"
    )
  );

  container.replaceChildren(metrics);

  displayBinaryComparison(result);
}

export function displayFullAvalanche(analysis) {
  const container = document.getElementById(
    "statistics-results"
  );

  const metrics = document.createElement("div");
  metrics.className = "statistics-metrics";

  metrics.append(
    createMetric(
      "Experiments",
      analysis.totalExperiments
    ),
    createMetric(
      "Average changed bits",
      analysis.averageChangedBits.toFixed(2)
    ),
    createMetric(
      "Average avalanche",
      `${analysis.averageAvalanchePercentage.toFixed(2)}%`
    ),
    createMetric(
      "Minimum distance",
      analysis.minimumChangedBits
    ),
    createMetric(
      "Maximum distance",
      analysis.maximumChangedBits
    ),
    createMetric(
      "Theoretical mean",
      "128 bits"
    )
  );

  container.replaceChildren(metrics);

  displayAvalancheChart(analysis.experiments);
}


function displayAvalancheChart(experiments) {
  const container = document.getElementById(
    "statistics-chart"
  );

  const wrapper = document.createElement("div");
  wrapper.className = "avalanche-chart";

  const title = document.createElement("h3");
  title.textContent = "Hamming Distance by Input Bit";

  const description = document.createElement("p");
  description.className = "statistics-hint";
  description.textContent =
    "Each bar represents a one-bit modification " +
    "of the original input.";

  // Area containing the vertical scale and plot.
  const chartLayout = document.createElement("div");
  chartLayout.className = "chart-layout";

  const yAxis = document.createElement("div");
  yAxis.className = "chart-y-axis";

  for (const value of [256, 192, 128, 64, 0]) {
    const tick = document.createElement("span");
    tick.textContent = String(value);
    yAxis.append(tick);
  }

  const plot = document.createElement("div");
  plot.className = "chart-plot";

  const reference = document.createElement("div");
  reference.className = "chart-reference";
  reference.title = "Theoretical mean: 128 bits (50%)";

  const bars = document.createElement("div");
  bars.className = "avalanche-bars";

  for (const experiment of experiments) {
    const bar = document.createElement("div");
    bar.className = "avalanche-bar";

    bar.style.height =
      `${(experiment.changedBits / 256) * 100}%`;

    bar.title =
      `Input bit ${experiment.bitIndex}: ` +
      `${experiment.changedBits} / 256 changed bits ` +
      `(${experiment.avalanchePercentage.toFixed(2)}%)`;

    bars.append(bar);
  }

  plot.append(reference, bars);
  chartLayout.append(yAxis, plot);

  const xAxis = document.createElement("p");
  xAxis.className = "chart-x-label";
  xAxis.textContent =
    `Input bit index (0–${experiments.length - 1})`;

  const legend = document.createElement("p");
  legend.className = "statistics-hint";
  legend.textContent =
    "Dashed line: theoretical expectation of " +
    "128 changed bits (50%).";

  wrapper.append(
    title,
    description,
    chartLayout,
    xAxis,
    legend
  );

  container.replaceChildren(wrapper);
}


function bytesToBinary(bytes) {
  return Array.from(bytes, byte =>
    byte.toString(2).padStart(8, "0")
  ).join("");
}

function displayBinaryComparison(result) {
  const container = document.getElementById(
    "statistics-chart"
  );

  const originalBits = bytesToBinary(result.originalHash);
  const modifiedBits = bytesToBinary(result.modifiedHash);

  const wrapper = document.createElement("div");
  wrapper.className = "binary-comparison";

  const title = document.createElement("h3");
  title.textContent = "Bit-by-Bit Hash Comparison";

  const description = document.createElement("p");
  description.className = "statistics-hint";
  description.textContent =
    "Red cells indicate bits that changed after " +
    "flipping one input bit.";

  const originalGrid = document.createElement("div");
  originalGrid.className = "binary-grid";

  const modifiedGrid = document.createElement("div");
  modifiedGrid.className = "binary-grid";

  const xorGrid = document.createElement("div");
  xorGrid.className = "binary-grid";

  let countedDifferences = 0;

  for (let i = 0; i < originalBits.length; i++) {
    const originalBit = originalBits[i];
    const modifiedBit = modifiedBits[i];

    const changed = originalBit !== modifiedBit;

    const xorBit = changed ? "1" : "0";

    const xorCell = document.createElement("span");
    xorCell.className = "binary-bit";
    xorCell.textContent = xorBit;
    xorCell.title = `Bit ${i}: ${originalBit} XOR ${modifiedBit} = ${xorBit}`;

    if (changed) {
       xorCell.classList.add("xor-changed");
    }

    xorGrid.append(xorCell);

    if (changed) {
      countedDifferences++;
    }

    const originalCell = document.createElement("span");
    originalCell.className = "binary-bit";
    originalCell.textContent = originalBit;
    originalCell.title = `Bit ${i}: ${originalBit}`;

    const modifiedCell = document.createElement("span");
    modifiedCell.className = "binary-bit";
    modifiedCell.textContent = modifiedBit;

    if (changed) {
      modifiedCell.classList.add("changed");
    }

    modifiedCell.title =
      `Bit ${i}: ${originalBit} → ${modifiedBit}`;

    originalGrid.append(originalCell);
    modifiedGrid.append(modifiedCell);
  }

  const originalLabel = document.createElement("h4");
  originalLabel.textContent = "Original Hash — 256 bits";

  const modifiedLabel = document.createElement("h4");
  modifiedLabel.textContent = "Modified Hash — 256 bits";

  const xorLabel = document.createElement("h4");
  xorLabel.textContent = "XOR Difference — 256 bits";

  const summary = document.createElement("p");
  summary.className = "binary-summary";

  summary.textContent =
    `Changed bits: ${countedDifferences} / 256 ` +
    `(${result.avalanchePercentage.toFixed(2)}%)`;

  wrapper.append(
    title,
    description,
    originalLabel,
    originalGrid,
    modifiedLabel,
    modifiedGrid,
    xorLabel,
    xorGrid,
    summary
  );

  container.replaceChildren(wrapper);
}


