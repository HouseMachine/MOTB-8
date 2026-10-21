# MOTB-8 — Industry Taxonomy Specification

Version: 0.1
Status: Initial reference baseline
Source: Monet Service Catalog Taxonomy v1.0

## 1. Purpose

MOTB-8 provides an open, extensible industry classification
framework for independently discoverable machine presences.

The taxonomy helps people, machines, and discovery services
understand the industries and activities associated with
a machine presence.

## 2. Initial Reference Baseline

The initial reference taxonomy contains:

- 33 domains, including OTHER.
- 225 categories.
- 1,148 subcategories.

The original hierarchy is preserved in:

vocabularies/industry/INDUSTRY-TAXONOMY-v0.1.md

This reference vocabulary is a starting point, not an
exhaustive classification of possible machine activity.

## 3. Classification Hierarchy

Domain -> Category -> Subcategory

Domain identifies a broad industry or activity area.

Category identifies a more specific classification
within that domain.

Subcategory provides additional specificity.

MOTB-8 supports multiple taxonomy classifications
for a single machine presence.

## 4. Industry Taxonomy vs. Machine Capabilities

Industry taxonomy describes where a machine operates.

Capabilities describe what a machine can do.

These are independent classification dimensions.

A machine may operate across multiple industries
and possess multiple capabilities.

## 5. Service Offerings

Service offerings describe specific services a machine
makes available to others.

Industry classifications and capabilities may help
describe and discover those offerings.

A taxonomy classification does not itself establish
that a service is available, authorized, or commercially offered.

## 6. Open Extensibility

The MOTB-8 reference taxonomy is not a closed enumeration.

Developers may:

- Use reference classifications.
- Declare custom classifications.
- Use OTHER where appropriate.
- Adopt independent third-party vocabularies.
- Publish additional classifications.

No central approval is required to create a machine
presence or describe its activities.

Custom declarations do not automatically become
part of the MOTB-8 reference vocabulary.

## 7. Versioning and Identity Permanence

Reference vocabularies may expand or evolve independently.

Changes to taxonomy classifications do not require
changing the permanent MOTB-8 Tag.

Beacon revisions remain subject to their established
signing and verification requirements.

## 8. Ecosystem Independence

MOTB-8 does not require:

- Monet registration.
- iEthereum.
- A centralized registry.
- A commercial marketplace.
- A specific settlement system.
- A mandatory classification authority.

The initial reference vocabulary may originate from
Monet's existing classifications without creating
a runtime dependency on Monet.

## 9. Provenance and Redistribution

The initial classification hierarchy was extracted
from Monet Service Catalog Taxonomy v1.0.

The classification hierarchy is adopted as the
MOTB-8 v0.1 reference baseline.

MOTB-8 maintains this vocabulary independently
and permits future extensions and alternatives.

## 10. Governing Principle

Classify broadly. Describe accurately. Remain extensible.
Preserve permanent machine identity.

Make Your Machine Discoverable.
