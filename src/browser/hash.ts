import canonicalize from "canonicalize";

import { validateBrowserBeaconStructure } from "./validate.js";

export async function computeBrowserBeaconHash(
  record: unknown
): Promise<string> {
  if (!validateBrowserBeaconStructure(record)) {
    throw new Error("Invalid Beacon structure for hashing");
  }

  const canonical = canonicalize(record);

  if (typeof canonical !== "string") {
    throw new Error("Beacon canonicalization failed");
  }

  const digest = new Uint8Array(
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(canonical)
    )
  );

  return Array.from(digest)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
