# MOTB-8 Feature — Discovery Profiles

## Make Your Machine Discoverable

MOTB-8 Discovery Profiles help people, machines,
and independent discovery services learn who
developed a machine and where to find additional
information about it.

Profiles are optional components of the signed Beacon.

## 1. What Are Discovery Profiles?

Discovery Profiles provide descriptive information
about developers, organizations, and public resources
associated with a machine presence.

They complement the machine's permanent Tag,
capabilities, catalogs, and protocol declarations.

## 2. Profile Structure

The Beacon supports three optional fields:

- `developers`: An array of developer names.
- `organizations`: An array of organization names.
- `links`: An array of public resource references.

A machine may identify multiple developers,
multiple organizations, and multiple links.

The schema does not impose a fixed maximum number
of entries in these arrays.

## 3. Multiple Developers and Organizations

MOTB-8 supports collaborative machine development.

A single machine presence may identify several
developers and organizations.

Duplicate names within each array are prohibited.

Listing a developer or organization does not
grant that party cryptographic control.

## 4. Profile Links

Each profile link supports:

- `type`: Required resource type, up to 100 characters.
- `url`: Required URI, up to 2,048 characters.
- `label`: Optional descriptive name, up to 160 characters.

Examples of profile links include:

- Developer websites.
- Organization websites.
- Source-code repositories.
- Technical documentation.
- Project information pages.
- Public machine documentation.

Multiple links may be declared within one Beacon.

## 5. Independent Discovery

Discovery Profiles allow information about a
machine to be referenced across independent
websites, repositories, and documentation systems.

MOTB-8 does not require these resources to be
hosted by a particular provider or registry.

Profile links are descriptive references, not
proof of ownership or endorsement.

## 6. Security and Identity

Discovery Profiles are included in the signed Beacon.

A valid Beacon signature protects the integrity
of the declared profile information.

It does not independently verify the identity,
affiliation, or legitimacy of listed developers
and organizations.

Profile declarations do not grant controller
authority or permission to update the Beacon.

Controller authority remains governed by the
Genesis binding and authorized signing mechanisms.

External links must be treated as untrusted
resources until independently verified.

## 7. Extensibility

Developers may add, update, or remove profile
information through authorized Beacon revisions.

These changes do not alter the permanent MOTB-8 Tag.

MOTB-8 does not require a central developer
directory, organization registry, or account system.

## 8. Benefits

### For Developers

Identify multiple contributors and provide
links to projects, repositories, and documentation.

### For Machine Operators

Maintain public information about the people
and organizations associated with a machine.

### For Other Machines

Discover technical resources, documentation,
and relevant organizational information.

### For the Broader Ecosystem

Support transparent, decentralized machine
discovery without mandatory accounts or registries.

## 9. Governing Principle

Make the people, organizations, and resources
associated with a machine discoverable without
confusing public attribution with controller authority.

MOTB-8 — Make Your Machine Discoverable.
