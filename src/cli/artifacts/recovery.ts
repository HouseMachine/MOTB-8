import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { verifyBeacon } from "../../beacon/verify.js";
import { verifyBeaconRevision } from "../../beacon/revision.js";
import { computeBeaconHash } from "../../beacon/hash.js";
import { getArtifactPaths } from "./paths.js";
import { getRevisionPaths } from "./revision-paths.js";

export type RecoveryStatus =
  | "CURRENT"
  | "PENDING_REVISION"
  | "LOCKED"
  | "MANUAL_REVIEW";

export function inspectPresenceRecovery(directory: string): RecoveryStatus {
  const paths = getArtifactPaths(directory);
  const revisions = getRevisionPaths(directory);

  if (existsSync(join(directory, ".motb8-write.lock"))) {
    return "LOCKED";
  }

  try {
    const genesis = JSON.parse(readFileSync(paths.genesis, "utf8"));
    const current = JSON.parse(readFileSync(paths.beacon, "utf8"));

    if (!verifyBeacon(current, genesis).valid) {
      return "MANUAL_REVIEW";
    }

    if (current.schemaVersion !== "1.1") {
      return "MANUAL_REVIEW";
    }

    const currentArchive = join(
      revisions.revisionsDir,
      `beacon-v1.1-r${current.revision}.json`
    );

    if (!existsSync(currentArchive)) {
      return "MANUAL_REVIEW";
    }

    const archived = JSON.parse(readFileSync(currentArchive, "utf8"));

    if (computeBeaconHash(current) !== computeBeaconHash(archived)) {
      return "MANUAL_REVIEW";
    }

    const names = readdirSync(revisions.revisionsDir);
    const revisionNumbers = names
      .filter(name => /^beacon-v1\.1-r[1-9]\d*\.json$/.test(name))
      .map(name => Number(name.match(/r(\d+)\.json$/)?.[1]));

    if (
      names.some(name =>
        name.startsWith("beacon-v1.1-") &&
        !/^beacon-v1\.1-r[1-9]\d*\.json$/.test(name)
      ) ||
      revisionNumbers.some(number =>
        !Number.isSafeInteger(number) ||
        number > current.revision + 1
      )
    ) {
      return "MANUAL_REVIEW";
    }

    const nextPath = join(
      revisions.revisionsDir,
      `beacon-v1.1-r${current.revision + 1}.json`
    );

    if (!existsSync(nextPath)) {
      return "CURRENT";
    }

    const next = JSON.parse(readFileSync(nextPath, "utf8"));

    return verifyBeaconRevision(current, next, genesis).valid
      ? "PENDING_REVISION"
      : "MANUAL_REVIEW";
  } catch {
    return "MANUAL_REVIEW";
  }
}
