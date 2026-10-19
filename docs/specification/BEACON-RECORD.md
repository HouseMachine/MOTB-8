# MOTB-8 — Beacon v0.1 Specification

**Phase:** 23.3
**Status:** Core architecture locked; schema implementation in progress

## 1. Purpose

The MOTB-8 Beacon is the mutable, signed, machine-readable description of one independently discoverable public machine presence.

The permanent Tag identifies the presence. The Beacon describes it.

Ordinary changes update and re-sign the Beacon without changing the Tag or immutable Genesis Record.

## 2. Required Presence Information

- name: Public machine/presence name.
- presenceScope: single or composite.
- presenceType: agent, machine, swarm, gateway, robot, iot-system, or other.
- customPresenceType: Required when presenceType is other.
- representedSystemCount: Required when presenceScope is composite.
- description: Required plain Unicode text, 20–500 characters.
- goodFaith: Required acknowledgment record.

## 3. Automatically Generated Information

- schemaVersion
- motb8Tag
- status: active upon creation
- createdAt
- updatedAt
- controller
- discoverySummary
- proof

The discoverySummary is generated deterministically from declared presence information. It is not a manually editable keyword field.

## 4. Optional Discovery Information

- Developer and business/organization information.
- Public profiles, GitHub, GitLab, websites, and documentation.
- Contact and reachability information.
- Domain/category/subcategory taxonomy.
- Machine capabilities.
- Native OFFER/SEEK catalogs and external catalog references.
- Protocol declarations and integration endpoints.
- Versioned extensible attachments.

Optional fields may be added or changed through authorized Beacon updates.

## 5. Cryptographic Authority

The Beacon is signed using the authorized controller's Ed25519 private key.

RFC 8785 JCS canonicalization is used for signing and verification.

The Beacon controller must be consistent with the established Genesis/controller-binding history.

A valid signature does not independently prove legal ownership, safety, reputation, or original Tag creation.

## 6. Persistence

The MOTB-8 Tag and original Genesis Record remain unchanged during ordinary Beacon updates.

The createdAt timestamp is immutable.

The updatedAt timestamp changes when the Beacon is updated and re-signed.

## 7. Public Information Guidance

Only publish information you are authorized to represent.

## 8. Optional Discovery Sections

All eight sections are optional and may be updated and re-signed without changing the permanent MOTB-8 Tag.

| Section | Structure | Purpose |
|---|---|---|
| taxonomy | Array | Domain, category, optional subcategory; multiple classifications |
| capabilities | Array | Stable capability-type IDs, names, descriptions, vocabulary references |
| profiles | Object | Multiple developers, organizations, websites, repositories, documentation and other links |
| reachability | Array | Multiple contact or interaction methods |
| catalogs | Object | Native OFFER/SEEK resources and external catalog references |
| protocols | Array | Protocol identifiers, versions, endpoints and documentation |
| relationships | Array | References to associated machine presences or external systems |
| attachments | Array | Typed, versioned, extensible discovery information |

### Extension Principles

- Developers may introduce new attachment types without changing the permanent Tag.
- Unknown attachment types may pass structural validation without being considered trusted.
- Capabilities identify types of functionality, not individual offerings.
- Catalog items retain their own resource identifiers.
- Relationships and public references do not transfer controller authority.
- Optional discovery fields are not required for basic MOTB-8 creation.
- Future implementations must enforce appropriate size, nesting and security limits.

## 9. Validation Boundaries

JSON Schema validates the Beacon's structure and declared field formats.

Separate verification logic must validate:

- The canonical Tag checksum.
- Ed25519 Beacon signatures.
- Controller continuity with the established Genesis binding.
- Deterministic discovery-summary generation.
- Timestamp and update consistency.
- Recognized extension-specific semantics.

Passing JSON Schema validation does not establish authenticity, original ownership, trustworthiness, or authorization.
