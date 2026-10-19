# MOTB-8 — Beacon Developer Guide

**Version:** v0.1
**Status:** Development
**Purpose:** Help developers understand, create, and eventually publish a MOTB-8 machine presence.

## 1. What Is a Beacon?

MOTB-8 (Machine Open Tag & Beacon) gives an independently discoverable machine presence a permanent public identifier.

The Tag identifies the presence. The Beacon describes it.

A Beacon contains structured information about a machine, AI agent, robot, IoT system, gateway, swarm, or other autonomous system.

The Beacon is designed to be publicly readable, cryptographically signed, and editable by its authorized controller.

## 2. What Information Is Required?

Developers provide:

- Machine or Presence Name.
- Presence Scope: Single or Composite.
- Presence Type: Agent, Machine, Swarm, Gateway, Robot, IoT System, or Other.
- Represented System Count when Composite is selected.
- Custom Presence Type when Other is selected.
- Short Description: 20–500 characters.
- Good-Faith Participation acknowledgment.

The software is designed to generate the permanent Tag, timestamps, controller information, status, discovery summary, and cryptographic proof.

No organization name, public contact information, website, or product catalog is required.

## 3. Optional Discovery Information

Developers can enrich their machine presence through eight optional sections.

| Section | What It Describes |
|---|---|
| Taxonomy | Industry domain, category, and optional subcategory |
| Capabilities | What the machine can do |
| Profiles | Developers, organizations, websites, repositories, and documentation |
| Reachability | Contact methods and machine interaction endpoints |
| Catalogs | Products, services, capabilities offered or sought |
| Protocols | Supported communication and integration protocols |
| Relationships | Associated machines, gateways, swarms, and external systems |
| Attachments | Additional structured discovery information |

Multiple entries are supported where appropriate.

Developers may add or remove optional information through future authorized Beacon updates.

## 4. Capabilities and Resources

Capability identifiers describe types of functionality, not individual products or service offerings.

Catalogs may describe resources using OFFER or SEEK.

A machine with multiple offerings ordinarily retains one MOTB-8 Tag.

Individual offerings may have separate resource identifiers.

MOTB-8 does not replace external resource identifiers, protocols, or settlement systems.

## 5. Local Control and Security

The MOTB-8 architecture uses locally generated Ed25519 controller keys.

The public controller key appears in the Genesis Record and Beacon.

The private controller key must remain private.

The planned encrypted Control File allows developers to securely retain and reuse their controller credentials.

Never publish private keys or the decrypted contents of a Control File.

## 6. Genesis and Verification

A Genesis Record associates the permanent Tag with its initial controller public key.

A valid Genesis signature proves possession of the corresponding private key.

It does not independently prove original ownership of the publicly reusable Tag.

MOTB-8 distinguishes cryptographically valid unanchored controller claims from independently established bindings.

Optional independent anchoring and conflicting Genesis resolution remain under development.

## 7. Publishing Your Machine Presence

The intended publishing workflow is:

1. Generate the permanent MOTB-8 Tag.
2. Generate the signed Genesis Record and Beacon.
3. Securely save and back up the private Control File.
4. Publish the public Genesis Record and Beacon at accessible locations.
5. Reference the public Tag in websites, repositories, documentation, catalogs, or other compatible systems.
6. Update and re-sign the Beacon whenever public machine information changes.

The permanent Tag and original Genesis Record remain unchanged.

The software will eventually provide a Publishing Kit with reusable snippets and instructions.

## 8. Public and Private Information

PUBLIC — May be shared or published:

- MOTB-8 Tag.
- Signed Genesis Record.
- Signed Beacon.
- Public discovery metadata.
- Publishing snippets and references.

PRIVATE — Must be protected:

- Controller private key.
- Decrypted controller credentials.
- Encrypted Control File and its unlocking credentials.

The encrypted Control File should be securely backed up and must not be published.

## 9. Current Implementation Status

Implemented and tested:

- Permanent Tag generation, parsing, and checksum validation.
- Ed25519 controller key generation.
- Locally signed Genesis Record creation.
- Genesis structural and signature verification.
- Beacon JSON Schema and structural validation tests.

Still under development:

- Beacon generation, signing, and authorized updates.
- Encrypted Control File management.
- Independent Genesis anchoring and conflict resolution.
- Publishing Kit and developer CLI.
- Public website Create and Manage interfaces.
- Advanced extension-specific validation.

The Beacon schema is currently a development specification, not a released final standard.

## 10. Good-Faith Participation

Only publish information you are authorized to represent.

Good-Faith acknowledgment records the operator's declaration. It does not establish verified identity, legal compliance, safety, reputation, or endorsement.

## 11. Guiding Principle

**Mark the machine. Describe the presence. Reference the mark wherever that machine participates.**
