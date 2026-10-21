# MOTB-8 — Machine Capabilities Reference Specification

Version: 0.1
Status: Initial reference baseline
Source: Monet Machine Registration capability vocabulary

## 1. Purpose

MOTB-8 supports machine-readable capability declarations
that help people, machines, and independent discovery
services understand what a machine presence can do.

Capabilities are descriptive declarations, not proof
that a machine can successfully perform an activity.

## 2. Initial Reference Vocabulary

The initial MOTB-8 capability reference contains 40
unique identifiers derived from Monet's machine-registration
capability vocabulary.

The reference data is maintained in:

vocabularies/capabilities/motb8-capabilities-v0.1.json

The vocabulary is optional and nonexclusive.

## 3. Capability Declarations

Beacon records support a capabilities array.

Each capability contains:

- id: Required capability identifier.
- name: Required human-readable capability name.
- description: Optional explanation.
- vocabulary: Optional vocabulary reference.

A machine may declare multiple capabilities.

## 4. Industry Classification and Capabilities

Industry taxonomy describes the industries or activity
areas associated with a machine presence.

Capabilities describe what the machine can do.

A capability may be relevant across multiple industries.

Neither classification dimension determines the other.

## 5. Service Offerings

A capability declaration does not automatically constitute
an available service offering.

Service catalogs may describe specific services,
delivery methods, availability, and other information.

MOTB-8 does not require a commercial marketplace,
payment system, or settlement network.

## 6. Open Extensibility

Developers may declare capabilities not present in the
initial reference vocabulary.

Independent implementations may publish alternative
or expanded capability vocabularies.

A missing reference match must not automatically
invalidate an otherwise structurally valid Beacon.

Custom capabilities do not automatically become part
of the MOTB-8 reference vocabulary.

## 7. Reference Lookup Functions

The reference implementation provides:

- getReferenceCapabilities()
- isReferenceCapability(capability)

These functions identify entries in the bundled
reference vocabulary.

They do not impose mandatory classification rules.

## 8. Versioning

Reference vocabularies may evolve independently
of the permanent MOTB-8 Tag.

Capability changes are recorded through authorized
Beacon updates and their signed revision history.

## 9. Security and Trust

Capability declarations are self-reported.

A valid Beacon signature establishes that the
associated controller signed the declaration.

It does not independently verify capability performance,
operator legitimacy, safety, or trustworthiness.

## 10. Provenance and Redistribution

The initial reference vocabulary was derived from
Monet's machine-registration capability definitions.

The capability identifiers are adopted as the
MOTB-8 v0.1 reference baseline.

The vocabulary remains independently extensible
and is not a mandatory classification authority.

## 11. Governing Principle

Describe capabilities openly. Preserve interoperability.
Never confuse a declared capability with verified performance.

Make Your Machine Discoverable.
