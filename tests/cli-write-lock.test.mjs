import assert from "node:assert/strict";
import { test } from "node:test";
import {
  mkdtempSync,
  existsSync,
  rmSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  withPresenceWriteLock
} from "../dist/cli/artifacts/write-lock.js";

test("write lock prevents overlapping operations", () => {
  const dir = mkdtempSync(join(tmpdir(), "motb8-lock-"));

  try {
    const result = withPresenceWriteLock(dir, () => {
      assert.equal(
        existsSync(join(dir, ".motb8-write.lock")),
        true
      );

      assert.throws(
        () => withPresenceWriteLock(dir, () => {}),
        /Another MOTB-8 write operation is in progress/
      );

      return "completed";
    });

    assert.equal(result, "completed");
    assert.equal(
      existsSync(join(dir, ".motb8-write.lock")),
      false
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("write lock releases after operation failure", () => {
  const dir = mkdtempSync(join(tmpdir(), "motb8-lock-failure-"));

  try {
    assert.throws(
      () => withPresenceWriteLock(dir, () => {
        throw new Error("Synthetic operation failure");
      }),
      /Synthetic operation failure/
    );

    assert.equal(
      existsSync(join(dir, ".motb8-write.lock")),
      false
    );

    assert.equal(
      withPresenceWriteLock(dir, () => "recovered"),
      "recovered"
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
