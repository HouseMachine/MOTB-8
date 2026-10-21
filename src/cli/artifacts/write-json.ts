import { openSync, writeFileSync, closeSync, unlinkSync } from "node:fs";

export function writeExclusiveJson(
  path: string,
  value: unknown,
  privateFile = false
): void {
  const json = JSON.stringify(value, null, 2) + "\n";

  const fd = openSync(
    path,
    "wx",
    privateFile ? 0o600 : 0o644
  );

  let completed = false;

  try {
    writeFileSync(fd, json, { encoding: "utf8" });
    completed = true;
  } finally {
    try {
      closeSync(fd);
    } finally {
      if (!completed) {
        try {
          unlinkSync(path);
        } catch {
          // Preserve the original write failure.
        }
      }
    }
  }
}
