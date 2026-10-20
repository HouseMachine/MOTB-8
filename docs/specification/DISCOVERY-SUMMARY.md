# MOTB-8 — Discovery Summary Specification

**Phase:** 23.6
**Version:** v0.1
**Status:** Initial deterministic format implemented and tested

## 1. Purpose

The discoverySummary field provides a concise, machine-readable description of an MOTB-8 presence.

It helps people, crawlers, and other machines understand the presence without requiring a centralized registry, index, or search service.

The summary is generated automatically from declared Beacon information.

It is not a manually editable keyword field.

## 2. Required Inputs

The v0.1 summary uses four Beacon fields:

- name
- presenceScope
- presenceType
- description

Optional taxonomy, capabilities, catalogs, protocols, and other discovery sections remain available separately in structured Beacon metadata.

## 3. Canonical Generation Rule

The v0.1 format is:

    <NAME> | <PRESENCE_SCOPE> <PRESENCE_TYPE> | <DESCRIPTION>

Generation procedure:

1. Trim leading and trailing whitespace from name.
2. Read presenceScope without modification.
3. Read presenceType without modification.
4. Trim leading and trailing whitespace from description.
5. Join the components using the exact separators shown above.

The separator is one space, a vertical bar, and one space.

The scope and type are separated by one space.

## 4. Example

Input:

    name: Atlas Research
    presenceScope: single
    presenceType: agent
    description: Autonomous research and information analysis system.

Generated output:

    Atlas Research | single agent | Autonomous research and information analysis system.

## 5. Determinism

Identical canonical inputs must produce identical discovery summaries.

The generator must not introduce:

- Random values.
- Current timestamps.
- External search results.
- AI-generated interpretations.
- Manually supplied keywords.

## 6. Validation

The generator rejects empty names and descriptions.

The Beacon JSON Schema separately enforces field lengths and allowed presence types.

The complete Beacon verification workflow must check that discoverySummary matches the deterministic output derived from the signed Beacon fields.

A valid signature alone does not establish that the summary follows the canonical generation rule.

## 7. Versioning

The v0.1 summary format is fixed for this implementation.

Future versions may introduce richer summaries derived from additional structured information.

Such changes must be explicitly versioned to preserve interoperability between independent implementations.

Changing the summary-generation format must never require changing the permanent MOTB-8 Tag.

## 8. Governing Principle

**Describe the presence consistently. Preserve the permanent identity.**
