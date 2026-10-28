import canonicalize from "canonicalize";

import type { GenesisRecord } from "../genesis/create.js";
import type { MOTB8BeaconV11 } from "../beacon/types-v1.1.js";
import type { EncryptedControlFile } from "../control/encrypt.js";
import type { BeaconChangesWithRemoval } from "../presence/apply-changes.js";

import { generateDiscoverySummary } from "../beacon/summary.js";
import { verifyBrowserBeacon } from "./verify-beacon.js";
import { validateUnsignedBrowserBeaconStructure } from "./validate.js";
import { computeBrowserBeaconHash } from "./hash.js";
import { unlockBrowserControlFile } from "./unlock.js";
import { verifyBrowserBeaconRevision } from "./revision.js";
import { applyBeaconChanges } from "../presence/apply-changes.js";

export interface UpdateBrowserPresenceBeaconInput {
  previousBeacon: MOTB8BeaconV11;
  genesis: GenesisRecord;
  controlFile: EncryptedControlFile;
  passphrase: string;
  changes: BeaconChangesWithRemoval;
}

export interface UpdatedBrowserPresenceBeacon {
  beacon: MOTB8BeaconV11;
  previousBeaconHash: string;
}

const ALLOWED_FIELDS = new Set([
  "name",
  "presenceScope",
  "presenceType",
  "description",
  "representedSystemCount",
  "customPresenceType",
  "taxonomy",
  "capabilities",
  "profiles",
  "reachability",
  "catalogs",
  "protocols",
  "relationships",
  "attachments"
]);

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export async function updateBrowserPresenceBeacon(
  input: UpdateBrowserPresenceBeaconInput
): Promise<UpdatedBrowserPresenceBeacon> {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid Beacon update request");
  }

  const previousResult = await verifyBrowserBeacon(
    input.previousBeacon,
    input.genesis
  );

  if (!previousResult.valid) {
    throw new Error("Previous Beacon verification failed");
  }

  if (input.previousBeacon.schemaVersion !== "1.1") {
    throw new Error("Authorized updates require Beacon v1.1");
  }

  const changes = input.changes;

  if (!changes ||
      typeof changes !== "object" ||
      Array.isArray(changes)) {
    throw new Error("Invalid Beacon update changes");
  }

  for (const field of Object.keys(changes)) {
    if (!ALLOWED_FIELDS.has(field)) {
      throw new Error(`Protected or unsupported Beacon field: ${field}`);
    }
  }

  const previous = input.previousBeacon;
  const { proof, ...unsignedPrevious } = previous;
  void proof;

  const previousBeaconHash = await computeBrowserBeaconHash(previous);

  const updatedAt = new Date(
    Math.max(
      Date.now(),
      Date.parse(previous.updatedAt) + 1
    )
  ).toISOString();

  const unsigned: Omit<MOTB8BeaconV11, "proof"> = {
    ...applyBeaconChanges(previous, changes),
    revision: previous.revision + 1,
    previousBeaconHash,
    updatedAt,
    discoverySummary: generateDiscoverySummary(
      applyBeaconChanges(previous, changes)
    )
  };

  if (!validateUnsignedBrowserBeaconStructure(unsigned)) {
    throw new Error("Invalid updated Beacon structure");
  }

  const privateKey = await unlockBrowserControlFile(
    input.controlFile,
    input.passphrase,
    input.genesis
  );

  const canonical = canonicalize(unsigned);

  if (typeof canonical !== "string") {
    throw new Error("Beacon canonicalization failed");
  }

  const signature = new Uint8Array(
    await crypto.subtle.sign(
      "Ed25519",
      privateKey,
      new TextEncoder().encode(canonical)
    )
  );

  const beacon: MOTB8BeaconV11 = {
    ...unsigned,
    proof: {
      type: "Ed25519Signature2026",
      verificationMethod: "#controller-1",
      canonicalization: "RFC8785-JCS",
      signature: encodeBase64Url(signature)
    }
  };

  const result = await verifyBrowserBeaconRevision(
    previous,
    beacon,
    input.genesis
  );

  if (!result.valid) {
    throw new Error(
      `Beacon revision verification failed: ${result.reason}`
    );
  }

  return {
    beacon,
    previousBeaconHash
  };
}
