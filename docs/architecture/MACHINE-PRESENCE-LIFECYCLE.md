# MOTB-8 — Machine Presence Lifecycle

**Phase:** 23.6
**Version:** v0.1
**Status:** Architecture approved; lifecycle implementation pending

## 1. Purpose

Define how MOTB-8 creates, secures, describes, and manages one independently discoverable public machine presence.

MOTB-8 (Machine Open Tag & Beacon) is an open-source, ecosystem-neutral identifier and discovery framework.

Its purpose is to make machines discoverable while preserving independent controller authority and allowing future development by third parties.

## 2. Core Components

| Component | Purpose | Persistence |
|---|---|---|
| Tag | Permanent public machine-presence identifier | Immutable |
| Genesis Record | Signed initial controller-binding claim | Immutable |
| Beacon | Signed public description and discovery metadata | Mutable through authorized updates |
| Control File | Encrypted private controller credentials | Locally managed and securely backed up |

The Tag identifies the presence.

Genesis establishes its initial cryptographic controller claim.

The Beacon describes the presence.

The Control File protects the credentials needed to manage it.

## 3. Initial Creation Lifecycle

The intended creation sequence is:

1. Collect required machine-presence information.
2. Collect optional discovery information.
3. Obtain the operator's Good-Faith acknowledgment.
4. Generate the permanent MOTB-8 Tag.
5. Generate the local Ed25519 controller keypair.
6. Create and sign the immutable Genesis Record.
7. Generate the deterministic discovery summary.
8. Create and sign the initial Beacon.
9. Encrypt the controller private key into the Control File.
10. Provide the public records and private Control File for appropriate saving and publication.

The software must not require conventional accounts, centralized registration, or mandatory independent anchoring.

## 4. Initial Beacon Requirements

The initial Beacon must:

- Reference the generated permanent Tag.
- Declare the Genesis controller public key.
- Include the required presence information.
- Include the Good-Faith acknowledgment.
- Begin with active status.
- Use consistent creation and update timestamps.
- Include a deterministically generated discovery summary.
- Be signed using the initial controller private key.

Optional discovery sections may be included without becoming mandatory.

## 5. Control File Protection

The private controller key must be encrypted before persistent storage.

The Control File uses the versioned encryption format defined in the Control File specification.

The operator must be instructed to save and securely back up the encrypted Control File.

The public Tag, Genesis Record, and Beacon must never contain the controller private key or Control File passphrase.

## 6. Authorized Beacon Updates

The intended update lifecycle is:

1. Obtain the encrypted Control File.
2. Unlock locally using the operator's passphrase.
3. Verify the associated Genesis Record.
4. Confirm the recovered controller key matches the established controller binding.
5. Validate the requested Beacon changes.
6. Preserve the permanent Tag and original creation timestamp.
7. Generate updated discovery information.
8. Update the Beacon timestamp and future revision metadata.
9. Sign the updated Beacon locally.
10. Verify the new Beacon before publication.
11. Release temporary sensitive credentials and close the signing context.

The original Genesis Record remains unchanged.

## 7. Operation-Oriented Signing

The preferred future website management workflow is:

    Unlock
      -> Verify Genesis
      -> Authorize operation
      -> Sign locally
      -> Clear temporary buffers
      -> Close signing context

Higher-level interfaces should not expose persistent decrypted private-key objects.

The current Node.js Control File implementation provides lower-level cryptographic primitives. The operation-oriented management interface remains to be implemented.

## 8. Verification and Authority

A valid Beacon signature proves cryptographic integrity under its declared controller key.

A matching, valid Genesis Record supports the initial controller claim.

A self-signed Genesis Record alone does not independently establish original Tag ownership.

Independent anchoring is optional and must remain separate from immutable Genesis.

Conflicting claims and advanced controller continuity require additional verification mechanisms.

## 9. Discovery and Extensibility

MOTB-8 supports optional discovery information including:

- Taxonomy.
- Capabilities.
- Profiles.
- Reachability.
- Catalogs.
- Protocols.
- Relationships.
- Versioned attachments.

New discovery extensions may be developed independently.

Unknown extensions must not automatically establish trust, authority, or permissions.

Registries, indexes, search services, and economic networks are optional downstream implementations, not mandatory dependencies of MOTB-8.

## 10. Implementation Boundaries

Already implemented:

- Permanent Tag generation and validation.
- Local Ed25519 controller generation.
- Signed Genesis creation and verification.
- Beacon schema, signing, and verification.
- Encrypted Control File creation and Genesis-bound unlocking.

Phase 23.6 implementation objectives:

- Integrated initial presence creation.
- Deterministic discovery-summary generation.
- Initial timestamp consistency.
- Authorized Beacon updates.
- Safe operation-oriented signing.
- Lifecycle integration and security tests.

Additional future work:

- Independent anchoring and conflict resolution.
- Authenticated revision ordering and rollback protection.
- Controller rotation and recovery.
- Browser-native secure key handling.
- Publishing Kit and website integration.

## 11. Governing Principles

**Mark the machine. Describe the presence. Reference the mark wherever that machine participates.**

**Protect the controller. Minimize key exposure. Verify authority. Preserve independent operation.**

The permanent identifier must remain stable while the machine presence evolves.

## 12. Validation Before Identity Generation

The MOTB-8 presence-creation coordinator validates operator-provided registration information before generating a permanent Tag or controller keypair.

### Required Sequence

1. Confirm that the registration is a valid object.
2. Reject attempts to supply or override system-generated fields.
3. Validate the Control File passphrase requirement.
4. Generate the deterministic discovery summary.
5. Validate registration information against the Beacon JSON Schema using temporary validation-only metadata.
6. Generate the permanent Tag and Ed25519 controller only after preliminary validation succeeds.
7. Construct and validate the actual unsigned Beacon.
8. Create the signed Genesis Record and Beacon.
9. Encrypt the controller private key into the Control File.
10. Verify the resulting Beacon against Genesis before returning the creation artifacts.

### Why This Matters

Generating cryptographic identities before validating registration information creates unnecessary sensitive credentials when a request is invalid.

Validation-before-generation reduces unnecessary key creation, avoids returning partially constructed machine presences, and establishes a consistent boundary for future website and developer integrations.

The temporary validation metadata is not a real machine identity and must never be published or returned as a generated presence.

### Timestamp Consistency

Initial Genesis and Beacon creation use one shared UTC timestamp.

The initial Beacon's createdAt and updatedAt values must match the Genesis createdAt timestamp.

Subsequent authorized Beacon updates preserve the original createdAt value while updating updatedAt.

### Security Boundary

Preliminary validation does not establish machine legitimacy, original Tag ownership, or independent Genesis authority.

A successful creation operation produces a cryptographically consistent initial presence whose Genesis controller claim remains VALID_UNANCHORED unless independently verified through a separately supported mechanism.
