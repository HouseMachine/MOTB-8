import { withPresenceWriteLock } from "./write-lock.js";
import {
  existsSync,
  readFileSync,
  renameSync,
  unlinkSync
} from "node:fs";
import { join } from "node:path";

import { computeBeaconHash } from "../../beacon/hash.js";
import { verifyBeaconRevision } from "../../beacon/revision.js";
import { getArtifactPaths } from "./paths.js";
import { getRevisionPaths } from "./revision-paths.js";
import { writeExclusiveJson } from "./write-json.js";

import type { GenesisRecord } from "../../genesis/create.js";
import type { MOTB8BeaconV11 } from "../../beacon/types-v1.1.js";
import type { UpdatedPresenceBeacon } from "../../presence/update-types.js";

export function writeUpdatedBeacon(
  directory: string,
  genesis: GenesisRecord,
  previous: MOTB8BeaconV11,
  update: UpdatedPresenceBeacon
) {
  return withPresenceWriteLock(directory, () => {
    const paths = getArtifactPaths(directory);
  const revisions = getRevisionPaths(directory);

  const storedGenesis = JSON.parse(
    readFileSync(paths.genesis, "utf8")
  );

  if (JSON.stringify(storedGenesis) !== JSON.stringify(genesis)) {
    throw new Error("Stored Genesis differs from supplied Genesis");
  }

  const current = JSON.parse(
    readFileSync(paths.beacon, "utf8")
  );

  if (computeBeaconHash(current) !== computeBeaconHash(previous)) {
    throw new Error("Current Beacon differs from update predecessor");
  }

  const verification = verifyBeaconRevision(
    previous,
    update.beacon,
    genesis
  );

  if (!verification.valid) {
    throw new Error(`Invalid Beacon revision: ${verification.reason}`);
  }

  if (update.previousBeaconHash !== computeBeaconHash(previous)) {
    throw new Error("Update predecessor hash mismatch");
  }

  if (!existsSync(revisions.revisionsDir)) {
    throw new Error("Revision history directory missing");
  }

  const filename = `beacon-v1.1-r${update.beacon.revision}.json`;
  const revisionPath = join(revisions.revisionsDir, filename);
  const temporary = join(paths.publicDir, ".beacon-update.tmp");

  if (existsSync(revisionPath) || existsSync(temporary)) {
    throw new Error("Revision destination already exists");
  }

  writeExclusiveJson(revisionPath, update.beacon);

  try {
    writeExclusiveJson(temporary, update.beacon);
    renameSync(temporary, paths.beacon);
  } catch (error) {
    try {
      unlinkSync(temporary);
    } catch {
      // Temporary file may not exist.
    }

    // Preserve the signed revision for recovery.
    throw error;
  }

  return {
    beacon: paths.beacon,
    revision: revisionPath
  };
  });
}
