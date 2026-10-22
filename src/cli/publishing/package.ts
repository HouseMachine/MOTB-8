import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  rmdirSync,
  unlinkSync,
  writeFileSync
} from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, resolve, sep } from "node:path";

import { collectPublishingSource } from "./collect.js";
import { assertSafePublishingPath } from "./safe-path.js";
import { getArtifactPaths } from "../artifacts/paths.js";
import { assertSafeParentPath } from "../artifacts/safe-parent.js";

export function preparePublishingPackage(
  sourceDirectory: string,
  outputDirectory: string
) {
  const source = collectPublishingSource(sourceDirectory);
  const paths = getArtifactPaths(sourceDirectory);
  const output = resolve(outputDirectory);

  if (
    output === paths.root ||
    output.startsWith(paths.root + sep) ||
    paths.root.startsWith(output + sep)
  ) {
    throw new Error("Publishing output must be separate from source");
  }

  const manifest = {
    format: "MOTB8_PUBLICATION_PACKAGE",
    version: "1.0",
    files: [] as Array<{ path: string; sha256: string }>
  };

  assertSafeParentPath(output);
  mkdirSync(output, { recursive: false });

  const createdFiles: string[] = [];
  const createdDirectories: string[] = [];

  try {
    for (const file of source.files) {
      assertSafePublishingPath(file);

      const relativePath = relative(paths.publicDir, file);

      if (
        relativePath.startsWith("..") ||
        relativePath === "" ||
        relativePath.startsWith(sep)
      ) {
        throw new Error("Unsafe publishing source path");
      }

      const destination = join(output, relativePath);
      const parent = resolve(destination, "..");

      if (parent !== output && !createdDirectories.includes(parent)) {
        mkdirSync(parent, { recursive: false });
        createdDirectories.push(parent);
      }

      createdFiles.push(destination);
      copyFileSync(file, destination, 1);

      const bytes = readFileSync(destination);
      const sha256 = createHash("sha256")
        .update(bytes)
        .digest("hex");

      manifest.files.push({
        path: relativePath.replaceAll("\\", "/"),
        sha256
      });
    }

    const manifestPath = join(output, "manifest.json");

    writeFileSync(
      manifestPath,
      JSON.stringify(manifest, null, 2) + "\n",
      { flag: "wx" }
    );

    createdFiles.push(manifestPath);

    return {
      outputDirectory: output,
      manifest
    };
  } catch (error) {
    for (const file of createdFiles.reverse()) {
      try {
        unlinkSync(file);
      } catch {
        // Preserve the original failure.
      }
    }

    for (const directory of createdDirectories.reverse()) {
      try {
        rmdirSync(directory);
      } catch {
        // Preserve unexpected contents.
      }
    }

    try {
      rmdirSync(output);
    } catch {
      // Preserve unexpected contents.
    }

    throw error;
  }
}
