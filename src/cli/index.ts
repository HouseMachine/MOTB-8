#!/usr/bin/env node

import { verifyArtifacts } from "./verify.js";
import { createPresenceFromCli } from "./create.js";

const args = process.argv.slice(2);

function showHelp(): void {
  console.log(`
MOTB-8 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Machine Open Tag & Beacon

Make Your Machine Discoverable

Usage:
  motb8 <command> [options]

Commands:
  help       Show available commands
  create     Create a machine presence
  verify     Verify MOTB-8 artifacts
  update     Update an authorized Beacon
  publish    Prepare portable publishing artifacts

Options:
  --help     Show this help message

MOTB-8 operates independently of Monet,
centralized registries, and hosted accounts.
`);
}

if (
  args.length === 0 ||
  args[0] === "help" ||
  args[0] === "--help"
) {
  showHelp();
} else if (args[0] === "create") {
  const registrationIndex = args.indexOf("--registration");
  const outputIndex = args.indexOf("--output");

  const registrationPath = registrationIndex >= 0
    ? args[registrationIndex + 1] : undefined;
  const outputDirectory = outputIndex >= 0
    ? args[outputIndex + 1] : undefined;

  if (!registrationPath || !outputDirectory ||
      registrationPath.startsWith("--") ||
      outputDirectory.startsWith("--")) {
    console.error(
      "Usage: motb8 create --registration <file> --output <directory>"
    );
    process.exitCode = 1;
  } else {
    try {
      await createPresenceFromCli(registrationPath, outputDirectory);
    } catch {
      console.error("Creation failed. Check registration and output settings.");
      process.exitCode = 1;
    }
  }
} else if (args[0] === "verify") {
  const genesisIndex = args.indexOf("--genesis");
  const beaconIndex = args.indexOf("--beacon");

  const genesisPath = genesisIndex >= 0
    ? args[genesisIndex + 1] : undefined;
  const beaconPath = beaconIndex >= 0
    ? args[beaconIndex + 1] : undefined;

  if (!genesisPath || !beaconPath ||
      genesisPath.startsWith("--") ||
      beaconPath.startsWith("--")) {
    console.error("Usage: motb8 verify --genesis <file> --beacon <file>");
    process.exitCode = 1;
  } else {
    try {
      if (!verifyArtifacts(genesisPath, beaconPath)) {
        process.exitCode = 1;
      }
    } catch {
      console.error("Verification failed: unable to read or verify artifacts");
      process.exitCode = 1;
    }
  }
} else {
  console.error(`Unknown or unavailable command: ${args[0]}`);
  process.exitCode = 1;
}
