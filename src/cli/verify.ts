import { readFileSync } from "node:fs";
import { verifyBeacon } from "../beacon/verify.js";
import type { GenesisRecord } from "../genesis/create.js";

export function verifyArtifacts(
  genesisPath: string,
  beaconPath: string
): boolean {
  const genesis = JSON.parse(
    readFileSync(genesisPath, "utf8")
  ) as GenesisRecord;

  const beacon = JSON.parse(
    readFileSync(beaconPath, "utf8")
  ) as unknown;

  const result = verifyBeacon(beacon, genesis);

  console.log(`Verification: ${result.valid ? "VALID" : "INVALID"}`);
  console.log(`Reason: ${result.reason}`);

  return result.valid;
}
