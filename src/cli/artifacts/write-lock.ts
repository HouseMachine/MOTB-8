import { closeSync, openSync, unlinkSync } from "node:fs";
import { join } from "node:path";

export function withPresenceWriteLock<T>(
  directory: string,
  operation: () => T
): T {
  const lockPath = join(directory, ".motb8-write.lock");

  let fd: number;

  try {
    fd = openSync(lockPath, "wx", 0o600);
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "EEXIST"
    ) {
      throw new Error(
        "Another MOTB-8 write operation is in progress"
      );
    }

    throw error;
  }

  try {
    return operation();
  } finally {
    try {
      closeSync(fd);
    } finally {
      unlinkSync(lockPath);
    }
  }
}
