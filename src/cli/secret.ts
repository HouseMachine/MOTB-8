import { StringDecoder } from "node:string_decoder";
import {
  processSecretInput,
  type SecretInputState
} from "./secret-input.js";

export async function readSecret(prompt: string): Promise<string> {
  if (!process.stdin.isTTY || !process.stdout.isTTY ||
      typeof process.stdin.setRawMode !== "function") {
    throw new Error("Interactive terminal required");
  }

  const input = process.stdin;
  const previousRawMode = input.isRaw;
  const decoder = new StringDecoder("utf8");

  let state: SecretInputState = {
    value: "",
    complete: false,
    cancelled: false
  };

  process.stdout.write(prompt);
  input.setRawMode(true);
  input.resume();

  try {
    return await new Promise<string>((resolve, reject) => {
      const cleanup = () => {
        input.off("data", onData);
        input.off("end", onEnd);
        input.off("error", onError);
      };

      const onEnd = () => {
        cleanup();
        reject(new Error("Terminal input closed"));
      };

      const onError = () => {
        cleanup();
        reject(new Error("Terminal input failed"));
      };

      const onData = (chunk: Buffer | string) => {
        const text = typeof chunk === "string"
          ? chunk
          : decoder.write(chunk);

        state = processSecretInput(state, text);

        if (state.cancelled) {
          cleanup();
          reject(new Error("Passphrase entry cancelled"));
          return;
        }

        if (state.complete) {
          cleanup();
          process.stdout.write("\n");

          if (state.value.length === 0) {
            reject(new Error("Passphrase cannot be empty"));
          } else {
            resolve(state.value);
          }
        }
      };

      input.on("data", onData);
      input.on("end", onEnd);
      input.on("error", onError);
    });
  } finally {
    input.setRawMode(Boolean(previousRawMode));
    input.pause();
  }
}
