import { lstatSync } from "node:fs";
import { dirname, parse } from "node:path";

export function assertSafePublishingPath(
  path: string
): void {
  let current = path;
  const root = parse(current).root;

  while (true) {
    const stat = lstatSync(current);

    if (stat.isSymbolicLink()) {
      throw new Error("Publishing path contains a symbolic link");
    }

    if (current === path && !stat.isFile()) {
      throw new Error("Publishing source must be a regular file");
    }

    if (current !== path && !stat.isDirectory()) {
      throw new Error("Publishing parent must be a directory");
    }

    if (current === root) break;

    current = dirname(current);
  }
}
