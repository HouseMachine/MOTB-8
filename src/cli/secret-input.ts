export interface SecretInputState {
  value: string;
  complete: boolean;
  cancelled: boolean;
}

export function processSecretInput(
  state: SecretInputState,
  text: string
): SecretInputState {
  let value = state.value;

  if (state.complete || state.cancelled) return state;

  for (const char of text) {
    if (char === "\u0003" || char === "\u001b") {
      return { value: "", complete: false, cancelled: true };
    }

    if (char === "\r" || char === "\n") {
      return { value, complete: true, cancelled: false };
    }

    if (char === "\b" || char === "\u007f") {
      value = Array.from(value).slice(0, -1).join("");
      continue;
    }

    if (char >= " ") {
      value += char;
    }
  }

  return { value, complete: false, cancelled: false };
}
