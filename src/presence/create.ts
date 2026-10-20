import { generateMotb8Tag } from "../tag/generate.js";
import { generateControllerKeyPair } from "../genesis/controller.js";
import { createGenesisRecord } from "../genesis/create.js";
import { signBeacon } from "../beacon/sign.js";
import { verifyBeacon } from "../beacon/verify.js";
import { validateUnsignedBeaconStructure } from "../beacon/validate.js";
import { generateDiscoverySummary } from "../beacon/summary.js";
import { encryptControlFile } from "../control/encrypt.js";

import type { UnsignedBeacon } from "../beacon/sign.js";
import type {
  CreatePresenceInput,
  CreatedPresence
} from "./types.js";

const GENERATED_FIELDS = [
  "schemaVersion",
  "motb8Tag",
  "status",
  "createdAt",
  "updatedAt",
  "controller",
  "discoverySummary",
  "proof"
];

export function createPresence(
  input: CreatePresenceInput
): CreatedPresence {
  if (
    !input ||
    typeof input !== "object" ||
    !input.registration ||
    typeof input.registration !== "object" ||
    Array.isArray(input.registration)
  ) {
    throw new Error("Invalid presence registration");
  }

  const registration = input.registration;

  for (const field of GENERATED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(registration, field)) {
      throw new Error(`Registration cannot override generated field: ${field}`);
    }
  }

  if (typeof input.passphrase !== "string" ||
      input.passphrase.length < 12) {
    throw new Error("Control File passphrase must contain at least 12 characters");
  }

  const summary = generateDiscoverySummary(registration);

  const validationBeacon = {
    ...registration,
    schemaVersion: "1.0",
    motb8Tag: "([[!MOTB-8:1:00000000000000000000000000000000:6S]])",
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    controller: {
      id: "#controller-1",
      type: "Ed25519",
      publicKeyJwk: {
        kty: "OKP",
        crv: "Ed25519",
        x: "A".repeat(43)
      }
    },
    discoverySummary: summary
  };

  if (!validateUnsignedBeaconStructure(validationBeacon)) {
    throw new Error("Invalid presence registration fields");
  }

  const tag = generateMotb8Tag();
  const controller = generateControllerKeyPair();
  const timestamp = new Date().toISOString();

  const unsignedBeacon: UnsignedBeacon = {
    ...registration,
    schemaVersion: "1.0",
    motb8Tag: tag,
    status: "active",
    createdAt: timestamp,
    updatedAt: timestamp,
    controller: {
      id: "#controller-1",
      type: "Ed25519",
      publicKeyJwk: controller.publicKeyJwk
    },
    discoverySummary: summary
  };

  if (!validateUnsignedBeaconStructure(unsignedBeacon)) {
    throw new Error("Invalid presence registration fields");
  }

  const genesis = createGenesisRecord(
    tag,
    controller.publicKeyJwk,
    controller.privateKey,
    timestamp
  );

  const beacon = signBeacon(unsignedBeacon, controller.privateKey);

  const controlFile = encryptControlFile(
    tag,
    controller.privateKey,
    input.passphrase
  );

  const verification = verifyBeacon(beacon, genesis);

  if (!verification.valid) {
    throw new Error(`Created presence verification failed: ${verification.reason}`);
  }

  return {
    tag,
    genesis,
    beacon,
    controlFile
  };
}
