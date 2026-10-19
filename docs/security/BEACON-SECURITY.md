# MOTB-8 — Beacon Security Model

**Phase:** 23.4
**Version:** v0.1
**Status:** Initial signing and verification implemented; advanced protections pending

## 1. Purpose

The MOTB-8 Beacon provides a mutable, cryptographically signed description of a permanent machine presence.

Beacon signatures protect record integrity and allow independent verification against an associated Genesis controller claim.

## 2. Implemented Controls

- Ed25519 Beacon signing.
- RFC 8785 JCS canonicalization.
- Canonical Tag and checksum validation during verification.
- Beacon JSON Schema validation.
- Independent public-key signature verification.
- Beacon-to-Genesis Tag matching.
- Beacon-to-Genesis controller public-key matching.
- Rejection of tested unauthorized content changes.
- Rejection of tested controller impersonation attempts.
- Rejection of malformed proof metadata.
- Explicit preservation of VALID_UNANCHORED Genesis status.

## 3. Signing Boundary

The Beacon signature covers the canonicalized Beacon content excluding the entire proof property.

The proof contains the signature, verification method, canonicalization declaration, and signature method identifier.

Proof metadata is separately validated against the Beacon JSON Schema.

## 4. Genesis Authority

A Beacon signed by the controller identified in a valid Genesis Record may be cryptographically verified.

However, an unanchored self-signed Genesis Record does not independently prove original ownership of the public Tag.

Beacon verification must not promote VALID_UNANCHORED into independently established ownership.

## 5. Security Limitations

The current implementation does not establish:

- Independent Genesis anchoring.
- Conflicting Genesis resolution.
- Current Beacon freshness.
- Replay or rollback protection.
- Controller rotation or recovery.
- Revocation or delegation.
- External resource ownership.
- Machine safety, reputation, or legal identity.

A previously signed Beacon may remain cryptographically valid even when it is no longer the current version.

## 6. Planned Security Improvements

- Authenticated Beacon revision ordering and freshness checks.
- Deterministic discovery-summary validation.
- Stronger runtime signing-input validation.
- Bounded Beacon and attachment sizes.
- Extension-specific validation.
- Optional independent Genesis anchoring.
- Controller continuity and future rotation support.

## 7. Security Principle

A valid Beacon signature proves integrity under the declared controller key.

Controller-binding verification determines whether that key is associated with the claimed MOTB-8 presence.

Neither result alone proves legal ownership, safety, trustworthiness, or endorsement.

## 8. Runtime Signing Validation

The Beacon signing function validates unsigned Beacon structure against the v0.1 JSON Schema before generating a signature.

The signing function also:

- Validates the canonical MOTB-8 Tag and checksum.
- Requires an Ed25519 private key.
- Confirms the signing private key matches the declared controller public key.
- Canonicalizes the unsigned Beacon using RFC 8785 JCS.
- Signs the canonical UTF-8 bytes.

Malformed records and mismatched controller keys are rejected before signing.

Structural validation does not establish the accuracy of declared information or independently prove controller ownership.

## 9. Implementation Status

The current implementation supports Beacon signing and verification against a supplied Genesis Record.

Remaining work includes authenticated Beacon revision/freshness handling, deterministic discovery-summary enforcement, bounded untrusted inputs, and the complete creation/update workflow.

The current verifier does not independently establish whether a valid signed Beacon is the latest published version.
