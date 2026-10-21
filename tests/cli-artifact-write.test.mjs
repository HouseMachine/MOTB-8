import assert from "node:assert/strict";
import { test } from "node:test";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  writeExclusiveJson
} from "../dist/cli/artifacts/write-json.js";

test("writes a new JSON artifact", () => {
  const dir = mkdtempSync(join(tmpdir(), "motb8-json-"));

  try {
    const path = join(dir, "synthetic.json");
    const artifact = {
      name: "Synthetic Machine",
      version: "1.0"
    };

    writeExclusiveJson(path, artifact);

    const saved = JSON.parse(readFileSync(path, "utf8"));

    assert.deepEqual(saved, artifact);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("refuses to overwrite an existing JSON artifact", () => {
  const dir = mkdtempSync(join(tmpdir(), "motb8-no-overwrite-"));

  try {
    const path = join(dir, "genesis.json");
    const original = { identity: "original" };

    writeExclusiveJson(path, original);

    assert.throws(
      () => writeExclusiveJson(path, { identity: "replacement" }),
      { code: "EEXIST" }
    );

    const saved = JSON.parse(readFileSync(path, "utf8"));

    assert.deepEqual(saved, original);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("serialization failure leaves no artifact file", () => {
  const dir = mkdtempSync(join(tmpdir(), "motb8-json-failure-"));

  try {
    const path = join(dir, "invalid.json");

    assert.throws(() =>
      writeExclusiveJson(path, {
        invalid: BigInt(123)
      })
    );

    assert.equal(existsSync(path), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
