import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { mkdtempSync, writeFileSync, rmSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createPresence } from "../dist/index.js";
import { writePresenceArtifacts } from "../dist/cli/artifacts/write-presence.js";

const cli = new URL("../dist/cli/index.js", import.meta.url);

function runCli(args) {
  return spawnSync(process.execPath, [fileURLToPath(cli), ...args], {
    encoding: "utf8",
    timeout: 10000
  });
}

test("CLI displays help", () => {
  const result = runCli(["--help"]);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Machine Open Tag & Beacon/);
  assert.match(result.stdout, /Make Your Machine Discoverable/);
});

test("CLI displays help without arguments", () => {
  const result = runCli([]);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage:/);
});

test("CLI rejects unknown commands", () => {
  const result = runCli(["unknown-command"]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown or unavailable command/);
});

test("CLI verify requires Genesis and Beacon paths", () => {
  const result = runCli(["verify"]);

  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /Usage: motb8 verify --genesis/
  );
});

test("CLI verify rejects missing Beacon path", () => {
  const result = runCli([
    "verify",
    "--genesis",
    "genesis.json"
  ]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage: motb8 verify/);
});

test("CLI verify rejects missing artifact files", () => {
  const result = runCli([
    "verify",
    "--genesis",
    "__missing_genesis__.json",
    "--beacon",
    "__missing_beacon__.json"
  ]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Verification failed/);
});

test("CLI verify rejects malformed JSON", () => {
  const dir = mkdtempSync(join(tmpdir(), "motb8-cli-test-"));

  try {
    const genesis = join(dir, "genesis.json");
    const beacon = join(dir, "beacon.json");

    writeFileSync(genesis, "{invalid json");
    writeFileSync(beacon, "{}");

    const result = runCli([
      "verify", "--genesis", genesis, "--beacon", beacon
    ]);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Verification failed/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});



test("CLI verifies valid signed Genesis and Beacon", () => {
  const dir = mkdtempSync(join(tmpdir(), "motb8-cli-valid-"));

  try {
    const created = createPresence({
      registration: {
        name: "Synthetic Test Machine",
        description: "A synthetic machine used for CLI verification testing.",
        presenceScope: "single",
        presenceType: "agent",
        goodFaith: {
          acknowledged: true,
          termsVersion: "1.0",
          acknowledgedAt: new Date().toISOString()
        }
      },
      passphrase: "SyntheticTestPassphrase123!"
    });

    const genesisPath = join(dir, "genesis.json");
    const beaconPath = join(dir, "beacon.json");

    writeFileSync(genesisPath, JSON.stringify(created.genesis));
    writeFileSync(beaconPath, JSON.stringify(created.beacon));

    const result = runCli([
      "verify",
      "--genesis", genesisPath,
      "--beacon", beaconPath
    ]);

    assert.equal(result.status, 0);
    assert.match(result.stdout, /Verification: VALID/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("CLI rejects a tampered signed Beacon", () => {
  const dir = mkdtempSync(join(tmpdir(), "motb8-cli-tamper-"));

  try {
    const created = createPresence({
      registration: {
        name: "Synthetic Test Machine",
        presenceScope: "single",
        presenceType: "agent",
        description: "A synthetic machine used for signature tampering tests.",
        goodFaith: {
          acknowledged: true,
          termsVersion: "1.0",
          acknowledgedAt: new Date().toISOString()
        }
      },
      passphrase: "SyntheticTestPassphrase123!"
    });

    const genesisPath = join(dir, "genesis.json");
    const beaconPath = join(dir, "beacon.json");

    const tampered = {
      ...created.beacon,
      name: "Unauthorized Modified Machine"
    };

    writeFileSync(genesisPath, JSON.stringify(created.genesis));
    writeFileSync(beaconPath, JSON.stringify(tampered));

    const result = runCli([
      "verify",
      "--genesis", genesisPath,
      "--beacon", beaconPath
    ]);

    assert.equal(result.status, 1);
    assert.match(result.stdout, /Verification: INVALID/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("CLI create requires registration and output paths", () => {
  const result = runCli(["create"]);

  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /Usage: motb8 create --registration/
  );
});

test("CLI create rejects missing output path", () => {
  const result = runCli([
    "create",
    "--registration",
    "registration.json"
  ]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage: motb8 create/);
});

test("CLI create rejects missing registration files", () => {
  const dir = mkdtempSync(join(tmpdir(), "motb8-create-missing-"));

  try {
    const output = join(dir, "machine-one");

    const result = runCli([
      "create",
      "--registration", join(dir, "missing.json"),
      "--output", output
    ]);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Creation failed/);
    assert.equal(existsSync(output), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("CLI create rejects malformed registration JSON", () => {
  const dir = mkdtempSync(join(tmpdir(), "motb8-create-invalid-"));

  try {
    const registration = join(dir, "registration.json");
    const output = join(dir, "machine-one");

    writeFileSync(registration, "{invalid json");

    const result = runCli([
      "create",
      "--registration", registration,
      "--output", output
    ]);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Creation failed/);
    assert.equal(existsSync(output), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("CLI create rejects noninteractive passphrase input", () => {
  const dir = mkdtempSync(join(tmpdir(), "motb8-create-no-tty-"));

  try {
    const registration = join(dir, "registration.json");
    const output = join(dir, "machine-one");

    writeFileSync(registration, JSON.stringify({
      name: "Synthetic CLI Machine",
      presenceScope: "single",
      presenceType: "agent",
      description: "A synthetic machine for testing noninteractive CLI creation.",
      goodFaith: {
        acknowledged: true,
        termsVersion: "1.0",
        acknowledgedAt: new Date().toISOString()
      }
    }));

    const result = runCli([
      "create",
      "--registration", registration,
      "--output", output
    ]);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Creation failed/);
    assert.equal(existsSync(output), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("CLI create accepts UTF-8 BOM registration files", () => {
  const dir = mkdtempSync(join(tmpdir(), "motb8-create-bom-"));

  try {
    const registration = join(dir, "registration.json");
    const output = join(dir, "machine-one");

    writeFileSync(
      registration,
      "\uFEFF" + JSON.stringify({
        name: "Synthetic BOM Test Machine",
        presenceScope: "single",
        presenceType: "agent",
        description: "A synthetic machine for testing Windows BOM compatibility.",
        goodFaith: {
          acknowledged: true,
          termsVersion: "1.0",
          acknowledgedAt: new Date().toISOString()
        }
      })
    );

    const result = runCli([
      "create",
      "--registration", registration,
      "--output", output
    ]);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Creation failed/);
    assert.equal(existsSync(output), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("CLI migrate requires a machine directory", () => {
  const result = runCli(["migrate"]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage: motb8 migrate/);
});

test("CLI update requires directory and changes file", () => {
  const result = runCli(["update"]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage: motb8 update/);
});

test("CLI publish requires source and output directories", () => {
  const result = runCli(["publish"]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage: motb8 publish/);
});

test("CLI publish prepares a public-only package", () => {
  const dir = mkdtempSync(join(tmpdir(), "motb8-cli-publish-"));

  try {
    const source = join(dir, "machine-one");
    const output = join(dir, "publication");

    const presence = createPresence({
      registration: {
        name: "Synthetic Publishing Machine",
        presenceScope: "single",
        presenceType: "agent",
        description: "A synthetic machine for testing the CLI publishing command.",
        goodFaith: {
          acknowledged: true,
          termsVersion: "1.0",
          acknowledgedAt: new Date().toISOString()
        }
      },
      passphrase: "SyntheticPublishingTest123!"
    });

    writePresenceArtifacts(source, presence);

    const result = runCli([
      "publish",
      "--directory", source,
      "--output", output
    ]);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /publishing package prepared/);

    const manifest = JSON.parse(
      readFileSync(join(output, "manifest.json"), "utf8")
    );

    assert.equal(manifest.format, "MOTB8_PUBLICATION_PACKAGE");

    const files = manifest.files.map(entry => entry.path);

    assert.equal(files.includes("genesis.json"), true);
    assert.equal(files.includes("beacon.json"), true);
    assert.equal(files.some(name => name.includes("control-file")), false);
    assert.equal(existsSync(join(output, "private")), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
