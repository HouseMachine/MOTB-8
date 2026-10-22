import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { verifyBeacon } from "../../beacon/verify.js";
import { verifyBeaconChain } from "../../beacon/chain.js";
import { computeBeaconHash } from "../../beacon/hash.js";
import { getArtifactPaths } from "../artifacts/paths.js";
import { getRevisionPaths } from "../artifacts/revision-paths.js";
import { assertSafePublishingPath } from "./safe-path.js";

export interface PublishingSource {
  genesis: unknown;
  beacon: unknown;
  files: string[];
}

export function collectPublishingSource(
  directory: string
): PublishingSource {
  const paths = getArtifactPaths(directory);
  const revisions = getRevisionPaths(directory);

  assertSafePublishingPath(paths.genesis);
  assertSafePublishingPath(paths.beacon);

  const genesis = JSON.parse(readFileSync(paths.genesis, "utf8"));
  const beacon = JSON.parse(readFileSync(paths.beacon, "utf8"));

  if (!verifyBeacon(beacon, genesis).valid) {
    throw new Error("Cannot publish an invalid Beacon");
  }

  const files = [paths.genesis, paths.beacon];

  if (beacon.schemaVersion === "1.1") {
    if (!existsSync(revisions.revisionsDir)) {
      throw new Error("Revision history directory missing");
    }

    const names = readdirSync(revisions.revisionsDir);
    const revisionNames = names.filter(
      name => /^beacon-v1\.1-r[1-9]\d*\.json$/.test(name)
    );

    if (revisionNames.length !== names.filter(
      name => name.startsWith("beacon-v1.1-")
    ).length) {
      throw new Error("Unrecognized v1.1 revision filename");
    }

    const records = revisionNames.map(name => {
      const file = join(revisions.revisionsDir, name);
      assertSafePublishingPath(file);
      return JSON.parse(readFileSync(file, "utf8"));
    });

    const chain = verifyBeaconChain(records, genesis);

    if (!chain.valid) {
      throw new Error(`Invalid supplied revision chain: ${chain.reason}`);
    }

    const latest = records.reduce((a, b) =>
      a.revision > b.revision ? a : b
    );

    if (computeBeaconHash(latest) !== computeBeaconHash(beacon)) {
      throw new Error("Current Beacon does not match latest archived revision");
    }

    for (const name of revisionNames.sort()) {
      files.push(join(revisions.revisionsDir, name));
    }
  }

  if (existsSync(revisions.legacyBeacon)) {
    files.push(revisions.legacyBeacon);
  }

  if (existsSync(revisions.migrationRecord)) {
    files.push(revisions.migrationRecord);
  }

  return { genesis, beacon, files };
}
