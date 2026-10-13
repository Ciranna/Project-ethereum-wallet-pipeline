
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
