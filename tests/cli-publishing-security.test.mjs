import assert from "node:assert/strict";
import { test } from "node:test";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  symlinkSync,
  rmSync
} from "node:fs";
import { tmpdir } from "node:os";
import { preparePublishingPackage } from "../dist/cli/publishing/package.js";
import { join } from "node:path";

import {
  assertSafePublishingPath
} from "../dist/cli/publishing/safe-path.js";

test("publishing rejects unsafe filesystem paths", (t) => {
  const root = mkdtempSync(join(tmpdir(), "motb8-publish-security-"));

  try {
    const publicDir = join(root, "public");
    const privateDir = join(root, "private");

    mkdirSync(publicDir);
    mkdirSync(privateDir);

    const publicFile = join(publicDir, "beacon.json");
    const privateFile = join(privateDir, "control-file.json");

    writeFileSync(publicFile, '{"synthetic":true}');
    writeFileSync(privateFile, '{"synthetic":"private"}');

    assert.doesNotThrow(() =>
      assertSafePublishingPath(publicFile)
    );

    assert.throws(() =>
      assertSafePublishingPath(publicDir),
      /regular file/
    );

    assert.throws(() =>
      assertSafePublishingPath(join(publicDir, "missing.json"))
    );

    const linkedFile = join(publicDir, "linked.json");

    try {
      symlinkSync(privateFile, linkedFile, "file");

      assert.throws(() =>
        assertSafePublishingPath(linkedFile),
        /symbolic link/
      );
    } catch (error) {
      if (error?.code === "EPERM" || error?.code === "EACCES") {
        t.diagnostic("File symlink unavailable on this system");
      } else {
        throw error;
      }
    }

    const linkedDir = join(root, "linked-public");

    try {
      symlinkSync(publicDir, linkedDir, "junction");

      assert.throws(() =>
        assertSafePublishingPath(join(linkedDir, "beacon.json")),
        /symbolic link/
      );
    } catch (error) {
      if (error?.code === "EPERM" || error?.code === "EACCES") {
        t.diagnostic("Directory junction unavailable");
      } else {
        throw error;
      }
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("invalid Beacon cannot create a publication directory", () => {
  const root = mkdtempSync(join(tmpdir(), "motb8-publish-failure-"));

  try {
    const source = join(root, "machine");
    const output = join(root, "publication");

    mkdirSync(source);
    mkdirSync(join(source, "public"));

    writeFileSync(
      join(source, "public", "genesis.json"),
      JSON.stringify({ synthetic: true })
    );

    writeFileSync(
      join(source, "public", "beacon.json"),
      JSON.stringify({ invalid: true })
    );

    assert.throws(() =>
      preparePublishingPackage(source, output)
    );

    assert.equal(existsSync(output), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
