# MOTB-8

**Machine Open Tag & Beacon**

**Make Your Machine Discoverable**

MOTB-8 is an open-source, ecosystem-neutral identifier and Beacon standard for persistent, discoverable machine presence.

It enables autonomous systems, AI agents, software services, robotics, and other independently discoverable machine presences to establish a permanent identifier and publish signed, updateable information about their capabilities, purposes, and reachability.

## Official Website

https://www.motb8.com

The official MOTB-8 website will provide a public-facing experience for learning about the standard and creating and managing machine presences.

The open-source implementation remains independently usable without the website.
## Core Components

- **MOTB-8 Tag:** Permanent machine-presence identifier.
- **Genesis Record:** Original cryptographic controller binding.
- **Beacon:** Signed, updateable machine-presence information.
- **Control File:** Encrypted controller credentials for authorized operations.
- **Revision Chain:** Verifiable history of signed Beacon updates.
- **Publishing Kit:** Portable public artifacts for independent hosting and distribution.

## Installation

Requirements: Node.js and npm.

Clone the repository and build:

    git clone https://github.com/HouseMachine/MOTB-8.git
    cd MOTB-8
    npm install
    npm run build

Run the CLI:

    node dist/cli/index.js --help

## CLI Commands

    motb8 create --registration registration.json --output machine-one
    motb8 verify --genesis genesis.json --beacon beacon.json
    motb8 migrate --directory machine-one
    motb8 update --directory machine-one --changes changes.json
    motb8 publish --directory machine-one --output publication

The CLI supports machine-presence creation, verification, authorized migration, signed updates, and preparation of portable public artifacts.

See [CLI Documentation](docs/CLI.md) for operational details and security considerations.

## Documentation

- [Tag Format](docs/specification/TAG-FORMAT.md)
- [Genesis Record](docs/specification/GENESIS-RECORD.md)
- [Beacon Record](docs/specification/BEACON-RECORD.md)
- [Beacon Revision Chain](docs/specification/BEACON-REVISION-CHAIN.md)
- [Machine Presence Lifecycle](docs/architecture/MACHINE-PRESENCE-LIFECYCLE.md)
- [Security Documentation](docs/security/)
- [Enterprise Readiness Framework](docs/ENTERPRISE-READINESS.md)

Additional specifications, developer guides, schemas, and reference vocabularies are included in the repository.

## Independence and Interoperability

MOTB-8 does not require Monet, a payment network, a centralized registry, a hosted account, or a particular discovery service.

Developers and third parties may independently implement compatible software, discovery services, hosting solutions, and optional enterprise security controls.

## Security and Trust

Cryptographic verification establishes signed-record integrity and controller binding under the applicable verification rules.

A valid MOTB-8 identifier does not independently establish publication freshness, lawful behavior, benevolence, or the truth of operator claims.

Private Control Files and passphrases must never be included in public publishing packages.

## Development

    npm run build
    npm test

## License

MOTB-8 is released under the MIT License.

Copyright (c) 2026 HouseMachine.

See [LICENSE](LICENSE) for the full license text.
