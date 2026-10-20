# MOTB-8 — Beacon Revision Chain Specification

**Phase:** 23.6
**Version:** v0.1
**Status:** Architecture approved; implementation pending

## 1. Purpose

Define how authorized MOTB-8 Beacon updates establish cryptographically verifiable continuity while preserving the permanent machine-presence identity.

The revision chain allows independent implementations to verify the relationship between successive signed Beacon records.

It does not require a centralized registry, blockchain, or mandatory third-party anchoring service.

## 2. Governing Principles

- The permanent MOTB-8 Tag remains unchanged.
- The original Genesis Record remains immutable.
- Ordinary updates preserve the established controller binding.
- Each new Beacon revision is independently signed.
- Revision history must be verifiable using public information.
- Revision continuity and current-version authority are separate verification questions.

## 3. Revision Fields

The Beacon revision model introduces:

| Field | Type | Purpose |
|---|---|---|
| revision | Positive integer | Identifies the Beacon revision |
| previousBeaconHash | SHA-256 digest | References the preceding signed Beacon |

The initial Beacon has revision 1 and no previousBeaconHash.

Each subsequent revision increments the preceding revision number by exactly one.

Each subsequent revision must reference the cryptographic hash of the immediately preceding signed Beacon.

## 4. Initial Beacon

The initial Beacon must:

- Use revision 1.
- Omit previousBeaconHash.
- Reference the permanent MOTB-8 Tag.
- Match the Genesis controller public key.
- Preserve the shared initial creation timestamp.
- Contain the required signed discovery information.

The initial Beacon establishes the beginning of the revision chain.

## 5. Subsequent Beacon Updates

For an authorized update:

1. Obtain the preceding signed Beacon.
2. Verify the preceding Beacon against the supplied Genesis Record.
3. Verify the controller authorization required for the update.
4. Preserve the permanent Tag and original createdAt timestamp.
5. Preserve the established controller binding for ordinary updates.
6. Increment revision by exactly one.
7. Compute the previousBeaconHash from the preceding signed Beacon.
8. Apply and validate the requested Beacon changes.
9. Regenerate the deterministic discovery summary.
10. Update updatedAt.
11. Sign the new Beacon locally.
12. Verify the resulting Beacon and revision relationship.

The original Genesis Record must not be modified.

## 6. Hash Calculation

The proposed v0.1 hash algorithm is SHA-256.

The hash input is the complete preceding signed Beacon, including its proof object.

The preceding Beacon is canonicalized using RFC 8785 JCS.

The SHA-256 digest is encoded as lowercase hexadecimal, producing exactly 64 characters.

The resulting hash is stored in the next Beacon's previousBeaconHash field.

Hashing the complete signed Beacon binds the revision to the exact preceding signed record, including its signature.

## 7. Revision Continuity Verification

Given two successive Beacon records, a verifier must confirm:

- Both records satisfy their applicable schemas.
- Both signatures are cryptographically valid.
- Both reference the same permanent Tag.
- The controller relationship is authorized.
- The newer revision equals the preceding revision plus one.
- The newer previousBeaconHash matches the calculated hash of the preceding signed Beacon.
- The original createdAt timestamp remains unchanged.
- The newer updatedAt timestamp advances consistently.

A revision number or previousBeaconHash supplied by an untrusted source must not be accepted without verification.

## 8. Freshness and Rollback Limitations

A valid revision chain proves continuity between the records supplied for verification.

It does not independently prove that the newest supplied revision is the latest published or authoritative revision.

An attacker or outdated publisher may present an older, correctly signed Beacon.

Detecting rollback or stale publication requires additional evidence, such as a trusted previously observed revision, authenticated publication state, or another independently supported checkpoint mechanism.

MOTB-8 must distinguish:

- Cryptographic signature validity.
- Revision-chain continuity.
- Current-version freshness.
- Controller-binding authority.

These determinations must not be silently conflated.

## 9. Missing and Conflicting Revisions

If a required preceding Beacon is unavailable, complete chain continuity cannot be established from the available evidence.

A missing predecessor does not automatically mean the supplied Beacon is malicious.

If two different signed Beacons claim the same revision under the same identity, the verifier must report the conflict rather than arbitrarily treating one as authoritative.

The exact conflict-reporting and resolution interfaces will be defined during implementation.

## 10. Controller Rotation

Ordinary Beacon updates retain the established controller binding.

Future controller rotation and recovery must use separately specified authorization and continuity mechanisms.

A revision-chain hash alone does not authorize a new controller.

Controller rotation must not alter the permanent MOTB-8 Tag or original Genesis Record.

## 11. Compatibility and Versioning

The existing Beacon v0.1 schema was introduced before revision-chain fields.

Introducing required revision metadata changes the Beacon validation contract.

Implementation must explicitly address compatibility with previously generated Beacon records.

Independent implementations must be able to identify the applicable schema and revision rules.

No existing permanent Tag may be changed merely because its Beacon format evolves.

## 12. Implementation Requirements

Before release, the implementation must include:

- Coordinated Beacon schema changes.
- Generated TypeScript type updates.
- Initial revision creation.
- Deterministic signed-Beacon hashing.
- Authorized revision advancement.
- Revision continuity verification.
- Negative tests for altered hashes and revision numbers.
- Tests for missing and conflicting predecessors.
- Compatibility tests for existing Beacon records.
- Developer documentation describing update and verification procedures.

## 13. Ecosystem Independence

Revision-chain verification must remain possible without mandatory participation in Monet, iEthereum, a centralized registry, blockchain, or commercial service.

Independent registries, indexes, publishers, and discovery services may provide additional freshness evidence.

Such services remain optional downstream implementations.

## 14. Governing Principle

**The Tag identifies. Genesis binds. The Beacon describes. The revision chain preserves continuity.**

Cryptographic continuity must never be misrepresented as independent proof of current authority.

## 15. Legacy Beacon v1.0 Transition Policy

### Existing Records

Previously signed Beacon v1.0 records remain valid under their original schema and cryptographic verification rules.

They must not be modified, rewritten, or silently assigned revision metadata.

Adding revision fields to an existing signed Beacon would change its signed content and invalidate its original signature.

### Establishing a v1.1 Revision Chain

An authorized controller may establish a new Beacon v1.1 revision chain for an existing MOTB-8 presence.

The transition must:

1. Verify the existing Beacon v1.0 against its Genesis Record.
2. Unlock and verify the authorized Genesis controller.
3. Preserve the permanent MOTB-8 Tag.
4. Preserve the original Genesis Record.
5. Preserve the original Beacon createdAt timestamp.
6. Construct a new Beacon with schemaVersion 1.1.
7. Set revision to 1.
8. Omit previousBeaconHash.
9. Regenerate the deterministic discovery summary.
10. Sign and verify the new Beacon.

The new v1.1 record establishes the beginning of a revision-aware chain.

It does not cryptographically reference the legacy v1.0 Beacon through previousBeaconHash.

### Verification Boundaries

A valid v1.0 Beacon and a valid v1.1 revision-1 Beacon may both exist for the same permanent Tag.

The presence of both records does not independently establish which is currently authoritative.

A separately supported authenticated publication or checkpoint mechanism may provide additional evidence of transition and current-version authority.

### Future Compatibility

A future versioned transition mechanism may introduce explicit cryptographic references to legacy Beacon records.

Such a mechanism must not retroactively alter existing signed records or silently redefine the meaning of v1.1 revision 1.

## 16. Implementation Status

Implemented and tested:

- Beacon v1.0 and v1.1 structural validation.
- Independent Ed25519 verification for both versions.
- Deterministic signed-Beacon hashing.
- v1.1 revision continuity verification.
- Rejection of invalid revision transitions.

Pending:

- Authorized Beacon update generation.
- Authorized legacy-to-v1.1 transition workflow.
- Full revision-history verification.
- Missing and conflicting revision reporting.
- Independently established freshness and rollback detection.

## 17. Complete Revision-Chain Verification

The MOTB-8 reference implementation provides:

    verifyBeaconChain(records, genesis)

This operation verifies an entire supplied collection of signed Beacon v1.1 records against the original Genesis Record.

### Verification Procedure

1. Verify every supplied Beacon's structure and Ed25519 signature.
2. Verify each Beacon against the supplied Genesis controller binding.
3. Require Beacon schema version 1.1.
4. Calculate the SHA-256 hash of each complete signed Beacon.
5. Identify conflicting signed records claiming the same revision.
6. Deduplicate identical signed records.
7. Sort unique records by revision number.
8. Require the initial revision to be revision 1.
9. Require the initial Beacon createdAt to match Genesis createdAt.
10. Require the initial Beacon updatedAt to equal createdAt.
11. Verify sequential revision numbers without gaps.
12. Verify predecessor hashes and controller continuity.
13. Verify preservation of the permanent Tag and original creation timestamp.
14. Verify advancement of update timestamps.

### Verification Statuses

| Status | Meaning |
|---|---|
| VALID_SUPPLIED_CHAIN | The supplied signed records form a valid continuous revision chain |
| INVALID | A supplied record or revision relationship fails verification |
| INCOMPLETE | Required revision records are missing |
| CONFLICTING | Different validly signed records claim the same revision |

### Verified Revision Count

The verifiedRevisions result represents the number of unique revisions successfully verified in sequence beginning with revision 1.

Identical duplicate records do not increase the count.

If a required revision is missing or a transition fails, the count excludes subsequent unverified revisions.

Conflict results do not claim a successfully verified authoritative chain.

### Conflicting Successors

Two different signed Beacons may reference the same predecessor and claim the same next revision.

Both signatures may be cryptographically valid.

The verifier reports CONFLICTING rather than arbitrarily selecting one successor.

Conflict resolution requires separately established publication or authority evidence.

### Freshness and Authority Limitations

VALID_SUPPLIED_CHAIN confirms continuity of the records provided to the verifier.

It does not independently establish:

- That the final revision is the latest published revision.
- That no additional valid signed revisions exist.
- That no conflicting branch exists outside the supplied records.
- That the original Genesis claim has been independently anchored.
- That the machine's declared information is truthful or trustworthy.

Authenticated publication state, trusted checkpoints, and independent discovery services may provide additional evidence.

Such services remain optional downstream implementations.

### Implementation Status

Complete-chain verification is implemented and covered by automated regression tests.

Further security review, bounded untrusted-input handling, authenticated freshness, and external publication integration remain separate work.

**Principle: Verify the supplied history. Report missing evidence. Never invent current authority.**

## 18. Revision-History Resource Limits

### Reference Implementation Limit

The Phase 23.6 reference implementation accepts a maximum of 1,000 supplied Beacon records per verifyBeaconChain() invocation.

The limit includes duplicate records.

Inputs exceeding this limit are rejected before individual Beacon signature verification begins.

This is a per-operation resource safeguard, not a lifetime limit on the number of revisions a machine presence may create.

### Verification Behavior

- Exactly 1,000 supplied records are permitted.
- More than 1,000 supplied records are rejected.
- Identical signed records are deduplicated after validation.
- Duplicate records do not increase verifiedRevisions.
- Conflicting signed records remain distinguishable.
- Valid supplied chains do not establish publication freshness.

### Security Limitations

The record-count limit alone does not provide comprehensive denial-of-service protection.

Additional protections remain necessary for:

- Individual Beacon byte sizes.
- Aggregate input byte sizes.
- JSON nesting depth and parsing complexity.
- Attachment payload sizes.
- Cryptographic verification workload.
- Concurrent verification requests.
- Memory consumption and execution time.

These protections must be reviewed before accepting arbitrary untrusted revision histories in a publicly exposed service.

### Interoperability

Independent implementations may use different resource limits appropriate to their environments.

A local processing limit must not be interpreted as a restriction on the MOTB-8 protocol's permanent identity or total historical revisions.

Large histories may require bounded verification windows, authenticated checkpoints, or other separately specified mechanisms.

**Principle: Bound the verification workload without limiting the permanent machine identity.**
