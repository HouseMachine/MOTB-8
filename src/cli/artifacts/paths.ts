import { resolve, join } from "node:path";
import {
  PUBLIC_ARTIFACTS,
  PRIVATE_ARTIFACTS
} from "./names.js";

export interface ArtifactPaths {
  root: string;
  publicDir: string;
  privateDir: string;
  genesis: string;
  beacon: string;
  controlFile: string;
}

export function getArtifactPaths(
  outputDirectory: string
): ArtifactPaths {
  if (
    typeof outputDirectory !== "string" ||
    outputDirectory.trim().length === 0
  ) {
    throw new Error("Invalid artifact output directory");
  }

  const root = resolve(outputDirectory);

  return {
    root,
    publicDir: join(root, "public"),
    privateDir: join(root, "private"),
    genesis: join(root, "public", PUBLIC_ARTIFACTS.genesis),
    beacon: join(root, "public", PUBLIC_ARTIFACTS.beacon),
    controlFile: join(root, "private", PRIVATE_ARTIFACTS.controlFile)
  };
}
