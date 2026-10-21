import { readFileSync } from "node:fs";

export function readRegistrationJson(path: string): unknown {
  return JSON.parse(
    readFileSync(path, "utf8").replace(/^\uFEFF/, "")
  );
}
