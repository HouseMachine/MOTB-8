import { verifyBeacon } from "./verify.js";
import { computeBeaconHash } from "./hash.js";

import type { GenesisRecord } from "../genesis/create.js";
import type { MOTB8BeaconV11 } from "./types-v1.1.js";

export interface BeaconRevisionVerificationResult {
  valid: boolean;
  reason: string;
}

export function verifyBeaconRevision(
  previousInput: unknown,
  currentInput: unknown,
  genesis: GenesisRecord
): BeaconRevisionVerificationResult {
  const previousResult = verifyBeacon(previousInput, genesis);
  const currentResult = verifyBeacon(currentInput, genesis);

  if (!previousResult.valid || !currentResult.valid) {
    return {
      valid: false,
      reason: "Predecessor or current Beacon verification failed"
    };
  }

  const previous = previousInput as MOTB8BeaconV11;
  const current = currentInput as MOTB8BeaconV11;

  if (
    previous.schemaVersion !== "1.1" ||
    current.schemaVersion !== "1.1"
  ) {
    return {
      valid: false,
      reason: "Revision continuity requires v1.1 Beacons"
    };
  }

  if (current.revision !== previous.revision + 1) {
    return {
      valid: false,
      reason: "Beacon revision sequence mismatch"
    };
  }

  if (current.previousBeaconHash !== computeBeaconHash(previous)) {
    return {
      valid: false,
      reason: "Previous Beacon hash mismatch"
    };
  }

  if (current.motb8Tag !== previous.motb8Tag) {
    return {
      valid: false,
      reason: "Beacon identity changed"
    };
  }

  if (current.createdAt !== previous.createdAt) {
    return {
      valid: false,
      reason: "Original creation timestamp changed"
    };
  }

  if (
    current.controller.publicKeyJwk.x !==
    previous.controller.publicKeyJwk.x
  ) {
    return {
      valid: false,
      reason: "Beacon controller changed"
    };
  }

  if (Date.parse(current.updatedAt) <= Date.parse(previous.updatedAt)) {
    return {
      valid: false,
      reason: "Beacon update timestamp did not advance"
    };
  }

  return {
    valid: true,
    reason: "Signed Beacon revision continuity verified"
  };
}
