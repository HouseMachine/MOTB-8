# MOTB-8 Feature — Catalogs

## Make Your Machine Discoverable

A machine identity becomes more useful when others can understand not only what the machine is, but also what it offers and what it needs.

MOTB-8 Catalogs provide a standardized way for machine presences to describe services, resources, and opportunities for interaction.

Catalogs are optional components of the MOTB-8 Beacon.

## 1. What Are Catalogs?

Catalogs are machine-readable descriptions of services or resources associated with a machine presence.

They help people, other machines, developers, and independent discovery services identify potential opportunities for interaction.

A machine can describe what it offers, what it seeks, or both.

## 2. Two Complementary Catalog Mechanisms

MOTB-8 supports two catalog mechanisms.

| Catalog Type | Purpose |
|---|---|
| `catalogs.native` | Describes individual services or resources directly within the Beacon |
| `catalogs.external` | References independently hosted catalogs containing additional information |

Both mechanisms may be used together.

### Native Catalogs

Native catalog entries contain:

| Field | Purpose |
|---|---|
| `id` | Identifies the individual catalog resource |
| `direction` | Declares `OFFER` or `SEEK` |
| `name` | Human-readable resource or service name |
| `description` | Describes the resource or service |
| `resourceUrl` | Optional URI for additional information |

Native catalog entries are included directly in the signed Beacon.

### External Catalogs

External catalog references contain:

| Field | Purpose |
|---|---|
| `url` | URI of an independently hosted catalog |
| `label` | Optional human-readable label |
| `format` | Optional format identifier |

External catalogs allow detailed information to remain outside the Beacon while remaining discoverable through it.

## 3. OFFER and SEEK

One of the most useful characteristics of MOTB-8 Catalogs is their bidirectional design.

### OFFER

An OFFER describes a service or resource a machine declares it can provide.

Examples:

- Research and analysis.
- Computing resources.
- Data processing.
- Reservation management.
- Robotics services.
- Specialized datasets.

### SEEK

A SEEK describes a service or resource a machine declares it is looking for.

Examples:

- Additional computing capacity.
- Specialized data.
- Research assistance.
- Equipment inspection.
- Translation services.
- External machine capabilities.

A single machine presence may declare both OFFER and SEEK entries.

## 4. Example: Autonomous Research Agent

An autonomous research agent might publish:

OFFER:
- Market intelligence reports.
- Competitive research.
- Automated information analysis.

SEEK:
- Specialized economic datasets.
- Additional computing capacity.
- Independent verification services.

Another machine or discovery system could use these declarations to identify potential complementary capabilities.

This does not automatically create a transaction, contractual relationship, or authorization to invoke the machine.

## 5. Catalogs and Machine Capabilities

Capabilities describe what a machine can do.

Catalogs describe particular services or resources the machine offers or seeks.

For example:

Capability: RESEARCH

Catalog OFFER: Produce a competitive market analysis.

These declarations complement one another but serve different purposes.

## 6. Catalogs and Industry Taxonomy

Industry taxonomy classifies the industries or activity areas associated with a machine presence.

Catalogs describe specific services or resources.

A machine may operate across several industries while offering multiple services.

Catalog entries are not required to belong to a centrally controlled industry classification.

## 7. Independent Hosting and Interoperability

MOTB-8 does not require catalogs to be hosted by MOTB-8, Monet, or any particular provider.

External catalogs may be maintained by machine operators, organizations, or independent third parties.

MOTB-8 provides discoverable references without requiring a centralized catalog service.

## 8. Economic and Non-Economic Uses

Catalogs can support commercial and noncommercial interactions.

Potential applications include:

- Machine-to-machine service discovery.
- Resource sharing.
- Commercial service advertising.
- Collaborative research.
- Autonomous workflow coordination.
- Public information services.
- Human-to-machine discovery.

MOTB-8 does not prescribe pricing, payments, settlement assets, marketplaces, or commercial terms.

## 9. Identity and Security

Catalog declarations are associated with the signed Beacon.

A valid Beacon signature establishes integrity and continuity under the associated Genesis controller binding.

It does not independently prove that a catalog offering is available, legitimate, safe, or deliverable.

External catalog contents are not automatically authenticated by the Beacon signature merely because their URL appears in the Beacon.

Independent implementations must apply appropriate security and verification policies when retrieving external resources.

## 10. Extensibility

Catalog information may evolve through authorized Beacon updates without changing the permanent MOTB-8 Tag.

More detailed service descriptions may be provided through external catalogs or future explicitly versioned extensions.

The initial catalog structure is not intended to restrict the kinds of services or resources machines may describe.

## 11. Benefits

### For Developers

A consistent way to expose machine services and resource needs without requiring integration with a particular marketplace.

### For Machine Operators

A discoverable description of what their machines offer and seek, associated with a persistent machine identity.

### For Other Machines

Structured information that may support capability matching, resource discovery, and interaction planning.

### For the Broader Ecosystem

An open foundation for independently developed discovery services, directories, coordination systems, and machine-to-machine applications.

## 12. Governing Principle

**A machine should be discoverable not only by what it is, but also by what it offers and what it seeks.**

MOTB-8 — Make Your Machine Discoverable.
