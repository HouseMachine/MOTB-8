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
