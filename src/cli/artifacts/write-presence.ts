import { rmdirSync, unlinkSync } from "node:fs";
import { prepareArtifactDirectory } from "./prepare.js";
import { writeExclusiveJson } from "./write-json.js";

import type { CreatedPresence } from "../../presence/types.js";

export function writePresenceArtifacts(
  outputDirectory: string,
  presence: CreatedPresence
) {
  const paths = prepareArtifactDirectory(outputDirectory);

  const written: string[] = [];

  try {
    writeExclusiveJson(paths.genesis, presence.genesis);
    written.push(paths.genesis);

    writeExclusiveJson(paths.beacon, presence.beacon);
    written.push(paths.beacon);

    writeExclusiveJson(
      paths.controlFile,
      presence.controlFile,
      true
    );
    written.push(paths.controlFile);

    return paths;
  } catch (error) {
    for (const file of written.reverse()) {
      try {
        unlinkSync(file);
      } catch {
        // Preserve unexpected files and the original failure.
      }
    }

    for (const directory of [
      paths.privateDir,
      paths.publicDir,
      paths.root
    ]) {
      try {
        rmdirSync(directory);
      } catch {
        // Never recursively delete unexpected contents.
      }
    }

    throw error;
  }
}
