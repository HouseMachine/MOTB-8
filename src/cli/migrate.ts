import { readFileSync } from "node:fs";
import { getArtifactPaths } from "./artifacts/paths.js";
import { writeMigrationArtifacts } from "./artifacts/write-migration.js";
import { migratePresenceBeacon } from "../presence/migrate.js";
import { readSecret } from "./secret.js";

import type { GenesisRecord } from "../genesis/create.js";
import type { MOTB8BeaconV01 } from "../beacon/types.js";
import type { EncryptedControlFile } from "../control/encrypt.js";

export async function migratePresenceFromCli(
  directory: string
): Promise<void> {
  const paths = getArtifactPaths(directory);

  const genesis = JSON.parse(
    readFileSync(paths.genesis, "utf8")
  ) as GenesisRecord;

  const legacyBeacon = JSON.parse(
    readFileSync(paths.beacon, "utf8")
  ) as MOTB8BeaconV01;

  const controlFile = JSON.parse(
    readFileSync(paths.controlFile, "utf8")
  ) as EncryptedControlFile;

  if (legacyBeacon.schemaVersion !== "1.0") {
    throw new Error("Migration requires Beacon v1.0");
  }

  const passphrase = await readSecret(
    "Enter Control File passphrase: "
  );

  const migrated = migratePresenceBeacon({
    legacyBeacon,
    genesis,
    controlFile,
    passphrase
  });

  const revisions = writeMigrationArtifacts(
    directory,
    genesis,
    legacyBeacon,
    migrated
  );

  console.log("MOTB-8 Beacon migration completed");
  console.log("Schema: 1.0 -> 1.1");
  console.log("Revision: 1");
  console.log(`Revision history: ${revisions.revisionsDir}`);
  console.log("Original signed Beacon preserved.");
  console.log("Migration Record is informational only.");
}
