import { readFileSync } from "node:fs";
import { getArtifactPaths } from "./artifacts/paths.js";
import { readRegistrationJson } from "./registration-json.js";
import { readSecret } from "./secret.js";
import { updatePresenceBeacon } from "../presence/update.js";
import { writeUpdatedBeacon } from "./artifacts/write-update.js";

import type { GenesisRecord } from "../genesis/create.js";
import type { MOTB8BeaconV11 } from "../beacon/types-v1.1.js";
import type { EncryptedControlFile } from "../control/encrypt.js";
import type { BeaconUpdateChanges } from "../presence/update-types.js";

export async function updatePresenceFromCli(
  directory: string,
  changesPath: string
) {
  const paths = getArtifactPaths(directory);

  const genesis = JSON.parse(
    readFileSync(paths.genesis, "utf8")
  ) as GenesisRecord;

  const previousBeacon = JSON.parse(
    readFileSync(paths.beacon, "utf8")
  ) as MOTB8BeaconV11;

  const controlFile = JSON.parse(
    readFileSync(paths.controlFile, "utf8")
  ) as EncryptedControlFile;

  const changes = readRegistrationJson(
    changesPath
  ) as BeaconUpdateChanges;

  if (previousBeacon.schemaVersion !== "1.1") {
    throw new Error("Beacon must be migrated to v1.1 before updating");
  }

  const passphrase = await readSecret(
    "Enter Control File passphrase: "
  );

  const updated = updatePresenceBeacon({
    previousBeacon,
    genesis,
    controlFile,
    passphrase,
    changes
  });

  const saved = writeUpdatedBeacon(
    directory,
    genesis,
    previousBeacon,
    updated
  );

  console.log("MOTB-8 Beacon updated");
  console.log(`Revision: ${updated.beacon.revision}`);
  console.log(`Current Beacon: ${saved.beacon}`);
  console.log(`Signed revision: ${saved.revision}`);

  return updated;
}
