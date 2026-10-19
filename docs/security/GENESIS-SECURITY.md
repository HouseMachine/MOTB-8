# MOTB-8 — Genesis Security Model

**Phase:** 23.2
**Version:** v0.1
**Status:** Initial implementation; advanced verification pending

## 1. Purpose

The Genesis Record establishes a cryptographically verifiable starting claim associating a permanent MOTB-8 Tag with an initial Ed25519 controller.

Genesis does not independently prove legal ownership, original creation priority, or operator identity.

## 2. Implemented Security Controls

- Cryptographically secure 160-bit Tag generation.
- Canonical Tag grammar and checksum validation.
- Local Ed25519 controller key generation.
- Public controller information represented as JWK.
- RFC 8785 JCS canonicalization before signing.
- Ed25519 Genesis signatures.
- Independent public-key signature verification.
- JSON Schema structural validation.
- Detection of tested Tag, timestamp, controller, and signature inconsistencies.
- Explicit VALID_UNANCHORED result for valid self-signed Genesis claims.

Private controller material is not included in public Genesis Records.

## 3. First-Contact Limitation

A valid self-signed Genesis Record proves possession of the private key corresponding to its declared public key.

It does not establish that the controller was the first party to generate or publish the MOTB-8 Tag.

Another party could copy a public Tag and create a competing self-signed Genesis claim.

Therefore, VALID_UNANCHORED must not be presented as verified original ownership.

## 4. Reserved Verification States

The verification model reserves:

- VALID_ANCHORED
- CONFLICTING
- INVALID
- UNRESOLVED

The current standalone verifier implements cryptographic validation and returns VALID_UNANCHORED or INVALID.

Independent anchoring, conflict evaluation, and unresolved-evidence handling require additional implementation.

## 5. Future Security Extensions

- Independent anchoring methods.
- Conflicting Genesis Record detection.
- Controller continuity across Beacon updates.
- Replay and stale-record protection.
- Controller rotation and recovery.
- Third-party authorization attachments.

These must remain independently verifiable and must not require a mandatory centralized registry.

## 6. Security Principle

Anyone may reference the mark. Only a controller authorized under an established binding may control the presence.

A valid signature is not proof of trustworthiness, safety, legality, or endorsement.
