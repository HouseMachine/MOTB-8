import { verifyBeacon } from "./verify.js";
import { verifyBeaconRevision } from "./revision.js";
import { computeBeaconHash } from "./hash.js";

import type { GenesisRecord } from "../genesis/create.js";
import type { MOTB8BeaconV11 } from "./types-v1.1.js";

export type BeaconChainStatus =
  | "VALID_SUPPLIED_CHAIN"
  | "INVALID"
  | "INCOMPLETE"
  | "CONFLICTING";

export interface BeaconChainVerificationResult {
  status: BeaconChainStatus;
  valid: boolean;
  reason: string;
  verifiedRevisions: number;
}

export function verifyBeaconChain(
  records: unknown,
  genesis: GenesisRecord
): BeaconChainVerificationResult {
  const fail = (
    status: BeaconChainStatus,
    reason: string,
    verifiedRevisions = 0
  ): BeaconChainVerificationResult => ({
    status,
    valid: false,
    reason,
    verifiedRevisions
  });

  if (!Array.isArray(records) || records.length === 0) {
    return fail("INCOMPLETE", "No Beacon revision records supplied");
  }

  if (records.length > 1000) {
    return fail(
      "INVALID",
      "Beacon revision history exceeds maximum supported record count"
    );
  }

  const unique = new Map<
    number,
    { beacon: MOTB8BeaconV11; hash: string }
  >();

  for (const record of records) {
    const result = verifyBeacon(record, genesis);

    if (!result.valid) {
      return fail("INVALID", "Beacon signature or structure invalid");
    }

    const beacon = record as MOTB8BeaconV11;

    if (beacon.schemaVersion !== "1.1") {
      return fail("INVALID", "Chain requires v1.1 Beacons");
    }

    const hash = computeBeaconHash(beacon);
    const existing = unique.get(beacon.revision);

    if (existing && existing.hash !== hash) {
      return fail(
        "CONFLICTING",
        `Conflicting signed Beacons at revision ${beacon.revision}`
      );
    }

    if (!existing) {
      unique.set(beacon.revision, { beacon, hash });
    }
  }

  const sorted = [...unique.values()]
    .map(entry => entry.beacon)
    .sort((a, b) => a.revision - b.revision);

  const first = sorted[0];

  if (!first || first.revision !== 1) {
    return fail("INCOMPLETE", "Initial revision 1 is missing");
  }

  if (first.createdAt !== genesis.createdAt) {
    return fail(
      "INVALID",
      "Initial Beacon and Genesis creation timestamps differ"
    );
  }

  if (first.updatedAt !== first.createdAt) {
    return fail(
      "INVALID",
      "Initial Beacon update timestamp must equal creation timestamp"
    );
  }

  let verifiedRevisions = 1;

  for (let i = 1; i < sorted.length; i++) {
    const previous = sorted[i - 1];
    const current = sorted[i];

    if (!previous || !current) {
      return fail(
        "INCOMPLETE",
        "Missing Beacon revision",
        verifiedRevisions
      );
    }

    if (current.revision !== previous.revision + 1) {
      return fail(
        "INCOMPLETE",
        `Missing revision between ${previous.revision} and ${current.revision}`,
        verifiedRevisions
      );
    }

    const result = verifyBeaconRevision(
      previous,
      current,
      genesis
    );

    if (!result.valid) {
      return fail(
        "INVALID",
        result.reason,
        verifiedRevisions
      );
    }

    verifiedRevisions++;
  }

  return {
    status: "VALID_SUPPLIED_CHAIN",
    valid: true,
    reason: "Supplied signed Beacon revision chain verified; current publication freshness not established",
    verifiedRevisions
  };
}
