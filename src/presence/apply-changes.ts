import type { MOTB8BeaconV11 } from "../beacon/types-v1.1.js";
import type { BeaconUpdateChanges } from "./update-types.js";

export type BeaconMutableField = keyof BeaconUpdateChanges;

export type BeaconChangesWithRemoval = {
  [K in BeaconMutableField]?: BeaconUpdateChanges[K] | null;
};

const ALLOWED_FIELDS = new Set<BeaconMutableField>([
  "name",
  "description",
  "presenceScope",
  "presenceType",
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

const OPTIONAL_FIELDS = new Set<BeaconMutableField>([
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

export function applyBeaconChanges(
  previous: MOTB8BeaconV11,
  changes: BeaconChangesWithRemoval
): Omit<MOTB8BeaconV11, "proof"> {
  const { proof, ...unsigned } = previous;
  void proof;

  const result: Record<string, unknown> = { ...unsigned };

  for (const [field, value] of Object.entries(changes)) {
    if (!ALLOWED_FIELDS.has(field as BeaconMutableField)) {
      throw new Error(`Protected or unsupported Beacon field: ${field}`);
    }

    if (value === undefined) {
      throw new Error(`Undefined Beacon update value: ${field}`);
    }

    if (value === null) {
      if (!OPTIONAL_FIELDS.has(field as BeaconMutableField)) {
        throw new Error(`Cannot remove required Beacon field: ${field}`);
      }

      delete result[field];
    } else {
      result[field] = value;
    }
  }

  return result as Omit<MOTB8BeaconV11, "proof">;
}
