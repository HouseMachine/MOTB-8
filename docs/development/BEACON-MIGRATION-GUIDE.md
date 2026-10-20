# MOTB-8 — Beacon Migration Developer Guide

**Phase:** 23.6
**Version:** v0.1
**Status:** Core migration implemented and tested; publication integration pending

## 1. Purpose

Explain how an existing signed MOTB-8 Beacon schema v1.0 record can transition to the revision-aware Beacon schema v1.1 format.

The migration preserves the permanent MOTB-8 identity and original Genesis Record.

Migration is an authorized local signing operation, not a centralized registration or identity reassignment.

## 2. Why Migration Is Necessary

Beacon schema v1.0 supports signed machine-presence descriptions but does not include revision-chain metadata.

Beacon schema v1.1 introduces:

- Sequential revision numbers.
- Cryptographic predecessor hashes.
- Verifiable continuity between successive signed revisions.

Existing signed records cannot be modified to add these fields without invalidating their original signatures.

## 3. Migration Inputs

The migratePresenceBeacon() function requires:

| Input | Purpose |
|---|---|
| legacyBeacon | Existing signed Beacon v1.0 |
| genesis | Original signed Genesis Record |
| controlFile | Encrypted controller credentials |
| passphrase | Locally supplied unlocking credential |

The operation must not require conventional accounts, a centralized registry, or mandatory third-party anchoring.

## 4. Migration Procedure

The implementation:

1. Verifies the original Beacon against Genesis.
2. Confirms the source Beacon uses schema version 1.0.
3. Confirms the original creation timestamp matches Genesis.
4. Computes the hash of the complete signed legacy Beacon.
5. Preserves the permanent Tag and established controller.
6. Preserves the original createdAt and Good-Faith acknowledgment.
7. Constructs a Beacon using schema version 1.1.
8. Sets revision to 1.
9. Omits previousBeaconHash.
10. Regenerates the deterministic discovery summary.
11. Validates the unsigned v1.1 Beacon.
12. Unlocks the encrypted Control File against Genesis.
13. Signs and verifies the new Beacon.
14. Returns the new signed Beacon and informational legacy hash.

## 5. Migration Output

The operation returns:

- beacon: The newly signed v1.1 revision-1 Beacon.
- legacyBeaconHash: SHA-256 hash of the original signed v1.0 Beacon.

The original v1.0 Beacon and Genesis Record remain unchanged.

The legacyBeaconHash is informational and is not inserted into the new Beacon's previousBeaconHash field.

## 6. Cryptographic Continuity Limitations

The new v1.1 Beacon is signed by the controller associated with Genesis.

However, revision 1 does not contain a predecessor hash.

Therefore, the new revision chain does not cryptographically reference the legacy v1.0 Beacon through the v1.1 predecessor mechanism.

The migration function verifies the supplied legacy record during the operation, but the resulting v1.1 Beacon alone does not prove that the migration occurred.

A future separately specified transition attestation may provide portable evidence linking the legacy and new records.

## 7. Publication and Authority

Both the original v1.0 Beacon and new v1.1 Beacon may remain publicly accessible.

A valid migration does not independently establish which record is currently authoritative.

Publication, authenticated checkpoints, conflict resolution, and freshness verification are separate concerns.

Registries, indexes, and discovery services may implement these capabilities independently.

They are not mandatory components of MOTB-8.

## 8. Security Requirements

Implementations must:

- Reject tampered legacy records.
- Reject incorrect Control File passphrases.
- Reject unrelated Genesis controller credentials.
- Preserve the permanent Tag.
- Preserve the original Genesis Record.
- Preserve the original creation timestamp.
- Preserve Good-Faith acknowledgment.
- Never publish decrypted private-key material.
- Avoid exposing decrypted controller credentials to higher-level application code.

The migration uses the internal operation-oriented signing helper.

This reduces unnecessary key exposure but does not guarantee complete memory erasure.

## 9. Implementation Status

Implemented and tested:

- Authorized v1.0-to-v1.1 migration.
- Signed legacy-record verification.
- Genesis-bound controller unlocking.
- New v1.1 revision-1 signing.
- Immutable-field preservation.
- Legacy record preservation.
- Incorrect-credential and tampering rejection.

Pending:

- Public website migration interface.
- Authenticated publication-state integration.
- Portable migration attestation.
- Independent freshness and conflict resolution.
- Additional security hardening.

## 10. Governing Principle

**Preserve the original record. Verify the controller. Establish the new revision chain without inventing historical continuity.**
