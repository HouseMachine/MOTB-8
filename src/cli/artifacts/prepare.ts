import { mkdirSync, rmdirSync } from "node:fs";
import { getArtifactPaths } from "./paths.js";
import { assertSafeParentPath } from "./safe-parent.js";
import { securePrivateDirectory } from "./permissions.js";

export function prepareArtifactDirectory(
  outputDirectory: string
) {
  const paths = getArtifactPaths(outputDirectory);

  assertSafeParentPath(paths.root);

  try {
    mkdirSync(paths.root, {
      recursive: false,
      mode: 0o700
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "EEXIST"
    ) {
      throw new Error("Artifact destination already exists");
    }

    throw error;
  }

  try {
    mkdirSync(paths.publicDir, {
      mode: 0o755
    });


    mkdirSync(paths.privateDir, {
      mode: 0o700
    });

    securePrivateDirectory(paths.privateDir);
  } catch (error) {
    try {
      rmdirSync(paths.privateDir);
    } catch {
      // Directory may not have been created.
    }

    try {
      rmdirSync(paths.publicDir);
    } catch {
      // Directory may not have been created.
    }

    try {
      rmdirSync(paths.root);
    } catch {
      // Preserve unexpected contents rather than delete them.
    }

    throw error;
  }

  return paths;
}
