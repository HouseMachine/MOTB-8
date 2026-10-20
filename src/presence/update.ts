import { verifyBeacon } from "../beacon/verify.js";
import { verifyBeaconRevision } from "../beacon/revision.js";
import { computeBeaconHash } from "../beacon/hash.js";
import { generateDiscoverySummary } from "../beacon/summary.js";
import { validateUnsignedBeaconStructure } from "../beacon/validate.js";
import { signAuthorizedBeacon } from "../control/sign-authorized.js";

import type { MOTB8BeaconV11 } from "../beacon/types-v1.1.js";
import type {
  UpdatePresenceBeaconInput,
  UpdatedPresenceBeacon
} from "./update-types.js";

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

export function updatePresenceBeacon(
  input: UpdatePresenceBeaconInput
): UpdatedPresenceBeacon {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid Beacon update request");
  }

  const previousResult = verifyBeacon(
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

  if (
    !changes ||
    typeof changes !== "object" ||
    Array.isArray(changes)
  ) {
    throw new Error("Invalid Beacon update changes");
  }

  for (const field of Object.keys(changes)) {
    if (!ALLOWED_FIELDS.has(field)) {
      throw new Error(`Protected or unsupported Beacon field: ${field}`);
    }
  }

  const previous = input.previousBeacon;
  const { proof, ...unsignedPrevious } = previous;

  const previousBeaconHash = computeBeaconHash(previous);

  const updatedAt = new Date(
    Math.max(
      Date.now(),
      Date.parse(previous.updatedAt) + 1
    )
  ).toISOString();

  const unsigned: Omit<MOTB8BeaconV11, "proof"> = {
    ...unsignedPrevious,
    ...changes,
    revision: previous.revision + 1,
    previousBeaconHash,
    updatedAt,
    discoverySummary: generateDiscoverySummary({
      ...previous,
      ...changes
    })
  };

  if (!validateUnsignedBeaconStructure(unsigned)) {
    throw new Error("Invalid updated Beacon structure");
  }

  const beacon = signAuthorizedBeacon({
    unsignedBeacon: unsigned,
    genesis: input.genesis,
    controlFile: input.controlFile,
    passphrase: input.passphrase
  });

  const result = verifyBeaconRevision(
    previous,
    beacon,
    input.genesis
  );

  if (!result.valid) {
    throw new Error(`Beacon revision verification failed: ${result.reason}`);
  }

  return {
    beacon,
    previousBeaconHash
  };
}
