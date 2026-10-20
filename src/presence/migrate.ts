import { verifyBeacon } from "../beacon/verify.js";
import { computeBeaconHash } from "../beacon/hash.js";
import { generateDiscoverySummary } from "../beacon/summary.js";
import { validateUnsignedBeaconStructure } from "../beacon/validate.js";
import { signAuthorizedBeacon } from "../control/sign-authorized.js";

import type { MOTB8BeaconV11 } from "../beacon/types-v1.1.js";
import type {
  MigratePresenceBeaconInput,
  MigratedPresenceBeacon
} from "./migration-types.js";

export function migratePresenceBeacon(
  input: MigratePresenceBeaconInput
): MigratedPresenceBeacon {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid Beacon migration request");
  }

  const legacyResult = verifyBeacon(
    input.legacyBeacon,
    input.genesis
  );

  if (!legacyResult.valid) {
    throw new Error("Legacy Beacon verification failed");
  }

  if (input.legacyBeacon.schemaVersion !== "1.0") {
    throw new Error("Migration requires legacy Beacon v1.0");
  }

  if (input.legacyBeacon.createdAt !== input.genesis.createdAt) {
    throw new Error("Legacy Beacon and Genesis creation timestamps differ");
  }

  const legacy = input.legacyBeacon;
  const { proof, ...legacyUnsigned } = legacy;

  const legacyBeaconHash = computeBeaconHash(legacy);

  const updatedAt = new Date(
    Math.max(
      Date.now(),
      Date.parse(legacy.updatedAt) + 1
    )
  ).toISOString();

  const unsigned: Omit<MOTB8BeaconV11, "proof"> = {
    ...legacyUnsigned,
    schemaVersion: "1.1",
    revision: 1,
    updatedAt,
    discoverySummary: generateDiscoverySummary(legacy)
  };

  if (!validateUnsignedBeaconStructure(unsigned)) {
    throw new Error("Invalid migrated Beacon structure");
  }

  const beacon = signAuthorizedBeacon({
    unsignedBeacon: unsigned,
    genesis: input.genesis,
    controlFile: input.controlFile,
    passphrase: input.passphrase
  });

  if (beacon.createdAt !== legacy.createdAt ||
      beacon.motb8Tag !== legacy.motb8Tag ||
      beacon.controller.publicKeyJwk.x !==
        legacy.controller.publicKeyJwk.x) {
    throw new Error("Migration altered immutable identity fields");
  }

  return {
    beacon,
    legacyBeaconHash
  };
}
