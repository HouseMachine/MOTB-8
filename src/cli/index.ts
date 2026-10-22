#!/usr/bin/env node

import { verifyArtifacts } from "./verify.js";
import { createPresenceFromCli } from "./create.js";
import { migratePresenceFromCli } from "./migrate.js";
import { updatePresenceFromCli } from "./update.js";
import { publishPresenceFromCli } from "./publish.js";

const args = process.argv.slice(2);

function showHelp(): void {
  console.log(`
MOTB-8 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Machine Open Tag & Beacon

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
} else if (args[0] === "migrate") {
  if (args.length !== 3 || args[1] !== "--directory" ||
      !args[2] || args[2].startsWith("--")) {
    console.error("Usage: motb8 migrate --directory <directory>");
    process.exitCode = 1;
  } else {
    try {
      await migratePresenceFromCli(args[2]);
    } catch {
      console.error("Migration failed. Check identity, authorization, and output.");
      process.exitCode = 1;
    }
  }
} else if (args[0] === "update") {
  if (
    args.length !== 5 ||
    args[1] !== "--directory" ||
    args[3] !== "--changes" ||
    !args[2] || !args[4] ||
    args[2].startsWith("--") ||
    args[4].startsWith("--")
  ) {
    console.error(
      "Usage: motb8 update --directory <directory> --changes <file>"
    );
    process.exitCode = 1;
  } else {
    try {
      await updatePresenceFromCli(args[2], args[4]);
    } catch {
      console.error("Update failed. Check authorization and revision history.");
      process.exitCode = 1;
    }
  }
} else if (args[0] === "publish") {
  if (
    args.length !== 5 ||
    args[1] !== "--directory" ||
    args[3] !== "--output" ||
    !args[2] || !args[4] ||
    args[2].startsWith("--") ||
    args[4].startsWith("--")
  ) {
    console.error(
      "Usage: motb8 publish --directory <directory> --output <directory>"
    );
    process.exitCode = 1;
  } else {
    try {
      publishPresenceFromCli(args[2], args[4]);
    } catch {
      console.error("Publishing preparation failed. Check source and output.");
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
