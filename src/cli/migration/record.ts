import { computeBeaconHash } from "../../beacon/hash.js";
import type { MigratedPresenceBeacon } from "../../presence/migration-types.js";

export interface MigrationRecord {
  recordType: "MOTB8_BEACON_MIGRATION";
  fromSchemaVersion: "1.0";
  toSchemaVersion: "1.1";
  migratedAt: string;
  legacyBeaconHash: string;
  migratedBeaconHash: string;
}

export function createMigrationRecord(
  migration: MigratedPresenceBeacon
): MigrationRecord {
  return {
    recordType: "MOTB8_BEACON_MIGRATION",
    fromSchemaVersion: "1.0",
    toSchemaVersion: "1.1",
    migratedAt: migration.migratedAt,
    legacyBeaconHash: migration.legacyBeaconHash,
    migratedBeaconHash: computeBeaconHash(migration.beacon)
  };
}
