import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmdirSync,
  unlinkSync
} from "node:fs";
import { join } from "node:path";

import { computeBeaconHash } from "../../beacon/hash.js";
import { verifyBeacon } from "../../beacon/verify.js";
import { verifyBeaconChain } from "../../beacon/chain.js";
import { getArtifactPaths } from "./paths.js";
import { getRevisionPaths } from "./revision-paths.js";
import { writeExclusiveJson } from "./write-json.js";
import { createMigrationRecord } from "../migration/record.js";

import type { GenesisRecord } from "../../genesis/create.js";
import type { MOTB8BeaconV01 } from "../../beacon/types.js";
import type { MigratedPresenceBeacon } from "../../presence/migration-types.js";

export function writeMigrationArtifacts(
  outputDirectory: string,
  genesis: GenesisRecord,
  legacyBeacon: MOTB8BeaconV01,
  migration: MigratedPresenceBeacon
) {
  const paths = getArtifactPaths(outputDirectory);
  const revisions = getRevisionPaths(outputDirectory);

  const storedGenesis = JSON.parse(
    readFileSync(paths.genesis, "utf8")
  );

  if (JSON.stringify(storedGenesis) !== JSON.stringify(genesis)) {
    throw new Error("Stored Genesis differs from migration Genesis");
  }

  const current = JSON.parse(readFileSync(paths.beacon, "utf8"));

  if (
    computeBeaconHash(current) !==
    computeBeaconHash(legacyBeacon)
  ) {
    throw new Error("Current Beacon differs from migration source");
  }

  if (!verifyBeacon(current, genesis).valid) {
    throw new Error("Current Beacon verification failed");
  }

  if (
    !verifyBeaconChain([migration.beacon], genesis).valid
  ) {
    throw new Error("Migrated Beacon chain verification failed");
  }

  if (
    existsSync(revisions.revisionsDir) ||
    existsSync(revisions.migrationRecord)
  ) {
    throw new Error("Migration artifacts already exist");
  }

  const temporary = join(paths.publicDir, ".beacon-migration.tmp");
  const written: string[] = [];
  let revisionsCreated = false;

  try {
    mkdirSync(revisions.revisionsDir);
    revisionsCreated = true;

    writeExclusiveJson(revisions.legacyBeacon, legacyBeacon);
    written.push(revisions.legacyBeacon);

    writeExclusiveJson(revisions.migratedBeacon, migration.beacon);
    written.push(revisions.migratedBeacon);

    writeExclusiveJson(
      revisions.migrationRecord,
      createMigrationRecord(migration)
    );
    written.push(revisions.migrationRecord);

    writeExclusiveJson(temporary, migration.beacon);
    written.push(temporary);

    renameSync(temporary, paths.beacon);

    return revisions;
  } catch (error) {
    for (const file of written.reverse()) {
      try {
        unlinkSync(file);
      } catch {
        // Preserve original error.
      }
    }

    if (revisionsCreated) {
      try {
        rmdirSync(revisions.revisionsDir);
      } catch {
        // Preserve unexpected contents.
      }
    }

    throw error;
  }
}
