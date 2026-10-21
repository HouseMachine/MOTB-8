import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  securePrivateDirectory
} from "../dist/cli/artifacts/permissions.js";

test("resolves Windows user SID without disclosure", () => {
  const dir = mkdtempSync(join(tmpdir(), "motb8-acl-test-"));

  try {
    assert.doesNotThrow(() => securePrivateDirectory(dir));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("private directory disables ACL inheritance", () => {
  if (process.platform !== "win32") return;

  const dir = mkdtempSync(join(tmpdir(), "motb8-acl-check-"));

  try {
    securePrivateDirectory(dir);

    const script = [
      "$ErrorActionPreference = 'Stop'",
      "try {",
      "  $acl = Get-Acl -LiteralPath $env:MOTB8_ACL_TEST_PATH",
      "  if ($acl.AreAccessRulesProtected) { exit 0 }",
      "} catch { exit 2 }",
      "exit 1"
    ].join("; ");

    const result = spawnSync(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", script],
      {
        windowsHide: true,
        stdio: "ignore",
        env: {
          ...process.env,
          MOTB8_ACL_TEST_PATH: dir
        }
      }
    );

    assert.equal(result.status, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("private directory has only approved access principals", () => {
  if (process.platform !== "win32") return;

  const dir = mkdtempSync(join(tmpdir(), "motb8-acl-rules-"));

  try {
    securePrivateDirectory(dir);

    const script = [
      "$ErrorActionPreference = 'Stop'",
      "$acl = Get-Acl -LiteralPath $env:MOTB8_ACL_TEST_PATH",
      "$userSid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value",
      "$allowed = @($userSid, 'S-1-5-18', 'S-1-5-32-544')",
      "if (-not $acl.AreAccessRulesProtected) { exit 1 }",
      "if (@($acl.Access).Count -ne 3) { exit 1 }",
      "foreach ($rule in $acl.Access) {",
      "  $sid = $rule.IdentityReference.Translate([System.Security.Principal.SecurityIdentifier]).Value",
      "  if ($sid -notin $allowed) { exit 1 }",
      "  if ($rule.AccessControlType -ne 'Allow') { exit 1 }",
      "  if (($rule.FileSystemRights -band [System.Security.AccessControl.FileSystemRights]::FullControl) -ne [System.Security.AccessControl.FileSystemRights]::FullControl) { exit 1 }",
      "}",
      "exit 0"
    ].join("; ");

    const result = spawnSync(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", script],
      {
        windowsHide: true,
        stdio: "ignore",
        env: {
          ...process.env,
          MOTB8_ACL_TEST_PATH: dir
        }
      }
    );

    assert.equal(result.status, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
