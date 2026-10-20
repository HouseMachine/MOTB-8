import { createHash } from "node:crypto";
import canonicalize from "canonicalize";

import { validateBeaconStructure } from "./validate.js";

export function computeBeaconHash(record: unknown): string {
  if (!validateBeaconStructure(record)) {
    throw new Error("Invalid Beacon structure for hashing");
  }

  const canonical = canonicalize(record);

  if (typeof canonical !== "string") {
    throw new Error("Beacon canonicalization failed");
  }

  return createHash("sha256")
    .update(Buffer.from(canonical, "utf8"))
    .digest("hex");
}
