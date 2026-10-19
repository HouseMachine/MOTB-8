# MOTB-8 — Canonical Tag Format

**Specification:** MOTB-8 v0.1
**Identifier grammar version:** 1
**Status:** Locked

## 1. Purpose

MOTB-8 (Machine Open Tag & Beacon) is an open-source protocol for establishing persistent, independently discoverable machine presences.

One MOTB-8 Tag identifies one independently discoverable public machine-presence boundary. It does not identify individual products, services, capabilities, transactions, endpoints, or other associated resources.

The Tag is permanent. Mutable information belongs in the associated signed Beacon.

## 2. Canonical Syntax

The canonical v1 Tag format is:

    ([[!MOTB-8:1:<IDENTITY_PAYLOAD>:<CHECKSUM>]])

The Tag consists of a distinctive discovery envelope, protocol sentinel, grammar version, permanent identity payload, and checksum.

The canonical Tag is designed to be recognizable in websites, repositories, documentation, and machine-readable resources.

## 3. Canonical Tag Components

| Component | Purpose |
|---|---|
| `([[` | Opening discovery envelope |
| `!MOTB-8` | Protocol sentinel identifying MOTB-8 |
| `:1` | Identifier grammar version, independent of software version |
| `:` | Separates fields for deterministic parsing |
| `IDENTITY_PAYLOAD` | Permanent 160-bit random identity |
| `CHECKSUM` | Two-character transcription-error detection |
| `]])` | Closing discovery envelope |

### Why the distinctive syntax matters

The opening `([[!MOTB-8:` sequence gives crawlers and other software a recognizable marker to search for in public text, websites, repositories, and machine-readable resources.

The enclosing punctuation establishes clear boundaries, helping parsers distinguish an MOTB-8 Tag from surrounding content.

The grammar version allows future identifier formats to be recognized without changing the meaning of existing v1 Tags.

The identity payload is independent of machine names, operators, websites, capabilities, and other mutable information.

The checksum helps detect accidental transcription errors. It does not authenticate the machine or prove ownership.


## 4. Identity Payload and Encoding

Each MOTB-8 v1 identity payload consists of:

- 160 bits (20 bytes) generated using a cryptographically secure random-number generator.
- Exactly 32 uppercase Crockford Base32 characters.
- No padding or separators within the payload.
- No mutable machine or operator information.

Canonical alphabet:

    0123456789ABCDEFGHJKMNPQRSTVWXYZ

Crockford Base32 excludes the ambiguous letters I, L, O, and U from its canonical alphabet.

Each Base32 character represents five bits. Therefore, 160 bits produce exactly 32 characters.

The 160-bit identity space provides approximately 1.46 x 10^48 possible payloads, making accidental collisions negligibly likely even at extremely large machine populations when secure randomness is used.

MOTB-8 does not require a central authority to issue random identity payloads.

A generated Tag must remain permanent and must never be intentionally recycled or reassigned.


## 5. Checksum Algorithm

MOTB-8 v1 uses a two-character Crockford Base32 checksum derived from SHA-256.

The checksum input is the canonical ASCII identifier core:

    MOTB-8:1:<IDENTITY_PAYLOAD>

Calculation:

1. Encode the canonical core as ASCII bytes.
2. Calculate its SHA-256 digest.
3. Extract the first 10 bits of the digest.
4. Encode those bits as two Crockford Base32 characters.
5. Append the checksum to the canonical Tag.

The opening and closing discovery envelopes are excluded from the hash input.

### Deterministic Test Vectors

| Identity Payload | Expected Checksum |
|---|---|
| 32 zero characters | `6S` |
| 32 Z characters | `JF` |

Complete zero-payload test Tag:

    ([[!MOTB-8:1:00000000000000000000000000000000:6S]])

These test vectors are for validation only. Production identifiers must use secure random generation.

### Security Limitation

The checksum detects many accidental transcription errors but does not provide cryptographic authentication.

A valid checksum does not prove ownership, controller authority, Beacon authenticity, or machine trustworthiness.

Those responsibilities belong to the separately specified Genesis binding and signed Beacon verification architecture.


## 6. Tag Parsing and Validation

A conforming MOTB-8 v1 validator must:

1. Recognize the exact opening envelope `([[`.
2. Recognize the exact closing envelope `]])`.
3. Require the `!MOTB-8` protocol sentinel.
4. Require identifier grammar version `1`.
5. Require exactly 32 canonical Crockford Base32 payload characters.
6. Require exactly two canonical Crockford Base32 checksum characters.
7. Recalculate the checksum and reject mismatches.
8. Reject malformed, truncated, or otherwise invalid Tags.

Canonical Tags use uppercase ASCII and are validated without silently changing their contents.

A valid Tag establishes syntactic validity and checksum consistency. It does not establish control of the associated machine presence.

## 7. Identity Persistence

One MOTB-8 Tag identifies one independently discoverable public machine-presence boundary.

A presence may represent one machine, agent, robot, gateway, IoT system, swarm, or multiple systems exposed collectively.

The Tag does not identify individual products, services, offerings, capabilities, transactions, or endpoints.

Ordinary changes to the machine's description, taxonomy, capabilities, catalogs, protocols, resources, or reachability update the signed Beacon.

The permanent Tag remains unchanged.

## 8. Cryptographic Authority Boundary

MOTB-8 distinguishes three separate concepts:

- Tag validity: correct grammar and checksum.
- Controller binding: cryptographic association between a Tag and controller authority.
- Beacon authenticity: verification of the signed Beacon under the established controller-binding model.

A copied public Tag does not grant control of the machine presence.

The proposed Genesis architecture establishes a locally signed initial controller-binding record. Independent anchoring and first-contact verification semantics are specified separately.

A self-signed Genesis Record alone does not prove original ownership of a publicly copyable Tag.

## 9. External Ecosystem References

External systems may reference MOTB-8 Tags as machine identity, association, provenance, or discovery metadata.

Those references do not transfer authority over the MOTB-8 presence or over the external system's own resources.

MOTB-8 remains ecosystem-neutral and does not require Monet, iEthereum, or any other economic network.

## 10. Governing Principle

**Mark the machine. Describe the presence. Reference the mark wherever that machine participates.**
