# MOTB-8 Command-Line Interface

**MOTB-8 — Machine Open Tag & Beacon**

Make Your Machine Discoverable

MOTB-8 is an ecosystem-neutral CLI for creating, verifying, updating, and preparing portable machine-presence records.

It operates independently of Monet, centralized registries, hosted accounts, and specific publishing providers.

## Installation

Requirements: Node.js and npm.

    npm install
    npm run build
    node dist/cli/index.js --help

The npm package exposes the motb8 executable.

## Commands

### Create
    motb8 create --registration registration.json --output machine-one

Creates a permanent Tag, signed Genesis, signed Beacon, and encrypted Control File.
The passphrase is entered interactively, never as a command-line argument.

### Verify
    motb8 verify --genesis genesis.json --beacon beacon.json

Verifies the Beacon against the supplied Genesis Record.
Successful verification does not establish independent ownership anchoring or publication freshness.

### Migrate
    motb8 migrate --directory machine-one

Establishes the initial v1.1 revision chain from an authorized v1.0 Beacon.
Preserves the original signed Beacon and creates an informational Migration Record.

### Update
    motb8 update --directory machine-one --changes changes.json

Creates the next authorized signed Beacon revision while preserving historical records.

### Publish
    motb8 publish --directory machine-one --output publication

Creates a portable public artifact package and SHA-256 manifest.
No files are automatically uploaded or registered.

## Artifact Structure

    machine-one/
      public/
        genesis.json
        beacon.json
        migration.json
        revisions/
          beacon-v1.0.json
          beacon-v1.1-r1.json
          beacon-v1.1-r2.json
      private/
        control-file.json

Migration and revision files appear only after the corresponding operations.

## Security and Recovery

- Keep the encrypted Control File private and backed up.
- Never publish the Control File or passphrase.
- Windows ACLs restrict ordinary local access, not administrators or compromised same-user processes.
- Multi-file updates are not fully atomic.
- Interrupted operations and concurrent filesystem changes may require manual recovery.
- Manifest hashes establish file integrity, not independent publication authenticity or freshness.

## Cryptographic Authority

The permanent Tag identifies the machine presence.
Genesis establishes the original cryptographic controller binding.
Authorized signed Beacons authenticate machine information and revisions.
Migration Records are informational only and establish no independent authority.

## Independence

MOTB-8 requires no Monet integration, centralized registry, hosted account, or specific discovery provider.
Third parties may independently implement compatible hosting, discovery, indexing, and publishing services.

## Interrupted Operations and Recovery

MOTB-8 uses an exclusive local write lock during migration and Beacon updates.
The lock prevents cooperating processes from modifying the same machine presence simultaneously.

If an operation is interrupted:

1. Stop all CLI operations involving the affected machine directory.
2. Make a secure backup of the complete machine directory.
3. Confirm that no writer is still active before considering removal of a stale lock.
4. Verify Genesis, the current signed Beacon, and available signed revision history.
5. Preserve valid signed records even when the current Beacon has not advanced.
6. Do not automatically promote pending revisions or regenerate historical signatures.
7. If records are missing, inconsistent, or conflicting, stop and perform manual review.

The recovery inspector reports CURRENT, PENDING_REVISION, LOCKED, or MANUAL_REVIEW.
These statuses are diagnostic and do not independently authorize filesystem changes.

A stale lock must not be removed solely because of its age.
The operator must first establish that no active writer remains.

Multi-file operations are not fully crash-atomic or guaranteed durable after power loss.
