import { lstatSync } from "node:fs";
import { dirname, parse } from "node:path";

export function assertSafeParentPath(path: string): void {
  let current = dirname(path);
  const root = parse(current).root;

  while (true) {
    const stat = lstatSync(current);

    if (stat.isSymbolicLink()) {
      throw new Error("Artifact parent path contains a symbolic link");
    }

    if (!stat.isDirectory()) {
      throw new Error("Artifact parent path is not a directory");
    }

    if (current === root) break;

    current = dirname(current);
  }
}
