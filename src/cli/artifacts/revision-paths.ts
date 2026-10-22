import { join } from "node:path";
import { getArtifactPaths } from "./paths.js";
import { REVISION_ARTIFACTS } from "./names.js";

export function getRevisionPaths(outputDirectory: string) {
  const paths = getArtifactPaths(outputDirectory);

  const revisionsDir = join(
    paths.publicDir,
    REVISION_ARTIFACTS.directory
  );

  return {
    revisionsDir,
    legacyBeacon: join(
      revisionsDir,
      REVISION_ARTIFACTS.legacyBeacon
    ),
    migratedBeacon: join(
      revisionsDir,
      REVISION_ARTIFACTS.migratedBeacon
    ),
    migrationRecord: join(
      paths.publicDir,
      REVISION_ARTIFACTS.migrationRecord
    )
  };
}
