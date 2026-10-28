# MOTB-8 Browser Cryptographic Integration

Status: Phase 23A.4 release candidate
Core version: 0.1.0

## Architecture

The MOTB-8 core repository owns protocol and cryptographic
functionality.

The MOTB-8 website is an interface to the core software.

Browser cryptographic operations execute locally using Web Crypto
and browser-compatible dependencies.

The existing Node.js core entry point remains unchanged.

## Browser functionality

- MOTB-8 Tag generation and checksum validation.
- Ed25519 controller key generation.
- Genesis Record creation and verification.
- Beacon v1.0 and v1.1 signing.
- Authoritative JSON Schema validation.
- scrypt and AES-256-GCM Control File encryption.
- Control File decryption.
- Genesis-bound controller unlocking.
- Non-extractable recovered signing keys.

## Security boundaries

Private controller keys and passphrases must not be transmitted
to MOTB-8 servers.

The public Beacon is intended for public disclosure.
Sensitive information must be omitted or referenced through
separately controlled resources.

A valid self-signed Genesis returns VALID_UNANCHORED.
This does not establish independent original ownership
of a publicly copyable Tag.

Control File encryption uses the canonical v1.0 format.

Temporary plaintext private-key material exists during
cryptographic operations. JavaScript cannot guarantee complete
memory erasure.

Operators must securely retain their encrypted Control File
and passphrase. Loss of required controller credentials may
prevent future authorized updates.

## Verification

- Browser and Node.js interoperability tests passed.
- Browser cryptographic acceptance tests passed in Chrome.
- Full automated regression suite: 290 tests passed.
- npm security audit: zero reported vulnerabilities.
- Existing repository ESLint check passed.
- TypeScript compilation and production builds passed.

## Tooling limitation

The repository uses TypeScript 7.0.2.

The attempted @typescript-eslint/parser version did not declare
compatibility with TypeScript 7.

Nine browser TypeScript parsing errors resulted from the
incompatible ESLint parser configuration, not confirmed
source-code defects.

The original ESLint configuration was restored.

Dedicated browser TypeScript linting remains pending compatible
tooling. No unsupported dependency overrides were applied.

## Release scope

This release provides the browser-compatible core implementation.

It does not complete the MOTB-8 website Create, Manage,
publishing, or discovery experience.

## Phase 23A.5-23A.7 Integration Update

The browser-compatible core is now integrated into the
MOTB-8 public website.

Website repository:
https://github.com/HouseMachine/MOTB-8-Web

Website:
https://motb8.com

### Browser Create Integration

The website uses the official MOTB-8 browser package to:

- Generate a permanent MOTB-8 Tag.
- Generate the local Ed25519 controller.
- Create and sign the Genesis Record.
- Create and sign the initial Beacon.
- Encrypt and export the Control File.
- Verify generated public records.
- Package public and private artifacts separately.

### Browser Manage Integration

The website supports:

- Importing Genesis, signed Beacon, and encrypted Control File.
- Local controller unlocking.
- Reconstructing editable Beacon information.
- Reviewing permitted changes.
- Authorizing and signing successor revisions.
- Independent revision verification.
- Downloading the updated signed Beacon.

The permanent Tag and original Genesis binding remain unchanged.

The browser update API supports explicit null removal
instructions for optional mutable Beacon fields.

See the Authorized Beacon Updates document for the
complete deletion contract and revision continuity rules.

### Verification Evidence

The MOTB-8 core regression suite passed 324 tests
following the explicit optional-field removal implementation.

The website subsequently passed:

- 20 Create generation tests.
- 15 Manage tests.
- TypeScript validation.
- ESLint validation.
- Next.js production build.
- Browser Create and Manage acceptance exercises.

The website Manage acceptance generated and downloaded
a signed revision 2 and successfully reimported it.

Independent verification of that specific downloaded
revision against its predecessor remains a final
release acceptance item.

### Publication and Security Boundaries

The website does not automatically publish generated
identities or signed Beacon revisions.

Operators must separately publish public records.

Encrypted Control Files, controller private keys,
and passphrases must not be publicly disclosed.

VALID_UNANCHORED indicates a valid self-asserted Genesis
binding, not independently established original ownership.

A valid signed revision does not establish that it is
the latest publicly available revision.

The website does not require a central registry,
mandatory blockchain, or server-side controller custody.
