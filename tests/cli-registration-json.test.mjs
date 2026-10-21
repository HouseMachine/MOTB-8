import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  readRegistrationJson
} from "../dist/cli/registration-json.js";

test("parses UTF-8 BOM registration JSON", () => {
  const dir = mkdtempSync(join(tmpdir(), "motb8-bom-reader-"));

  try {
    const path = join(dir, "registration.json");

    writeFileSync(
      path,
      "\uFEFF" + JSON.stringify({
        name: "Synthetic BOM Machine",
        presenceScope: "single"
      })
    );

    const result = readRegistrationJson(path);

    assert.equal(result.name, "Synthetic BOM Machine");
    assert.equal(result.presenceScope, "single");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
