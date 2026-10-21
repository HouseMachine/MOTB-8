import assert from "node:assert/strict";
import { test } from "node:test";

import { readSecret } from "../dist/cli/secret.js";

test("rejects noninteractive secret input", async () => {
  await assert.rejects(
    readSecret("Test prompt: "),
    /Interactive terminal required/
  );
});
