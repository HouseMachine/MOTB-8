# MOTB-8 — Key & Memory Protection Architecture

**Phase:** 23.5
**Version:** v0.1
**Status:** Security architecture approved; implementation ongoing

## 1. Purpose

Define how MOTB-8 minimizes exposure of sensitive controller credentials during encryption, decryption, verification, signing, and machine-presence management.

MOTB-8 is local-first, open-source, ecosystem-neutral, and does not require conventional accounts or server-held private keys.

The objective is to minimize exposure of sensitive information throughout its lifecycle.

## 2. Memory Erasure Limitations

Complete erasure of sensitive information cannot be guaranteed in JavaScript, Node.js, or browser environments.

Even when an application overwrites a memory buffer, cryptographic libraries, language runtimes, garbage collectors, or operating systems may retain additional copies.

MOTB-8 therefore requires best-effort clearing of sensitive buffers under application control and minimizing the lifetime and accessibility of sensitive credentials.

Buffer clearing must never be represented as a guarantee of complete memory erasure.

## 3. Required and Recommended Protections

| Protection | Purpose |
|---|---|
| Explicit buffer clearing | Overwrite plaintext key bytes and derived encryption keys after use |
| Short-lived key access | Unlock the controller only for an authorized operation |
| Isolated cryptographic execution | Keep sensitive operations separate from general application logic |
| No plaintext persistence | Never write decrypted keys to databases, logs, or ordinary files |
| Memory-only credentials | Avoid localStorage, sessionStorage, and other persistent browser storage for plaintext credentials |
| Hardware-backed keys | Optionally support non-exportable keys through compatible secure hardware |
| Process isolation | Reduce the lifetime and reach of sensitive material in memory |

These protections must be applied according to the capabilities and limitations of the execution environment.

## 4. Three Levels of Protection

### Level 1 — Encrypted Control File (v0.1)

The initial MOTB-8 implementation uses:

- AES-256-GCM authenticated encryption.
- scrypt passphrase-based key derivation.
- Fresh random salts and nonces.
- Local-only decryption.
- Best-effort clearing of sensitive buffers.
- Short-lived private-key access.
- Genesis-bound controller verification.
- No server-held private keys.

Level 1 is the required initial implementation foundation.

### Level 2 — Isolated Signing Environment

Where supported, unlocking and signing should occur in a short-lived isolated execution environment.

The environment should:

1. Receive the minimum information required for an authorized operation.
2. Unlock the controller locally.
3. Verify the associated Genesis controller binding.
4. Perform the authorized signing operation.
5. Clear temporary sensitive buffers where possible.
6. Release references to sensitive key material.
7. Terminate the isolated execution context.

Isolation reduces exposure but does not guarantee complete memory erasure or protection against a compromised host.

Level 2 must remain compatible with the Level 1 Control File architecture.

### Level 3 — Hardware-Backed Controller

Future implementations may support non-exportable controller private keys held in compatible secure hardware.

Signing should occur through the hardware interface without exposing raw private-key bytes to ordinary application code.

Potential implementations include compatible hardware security modules, secure elements, and other cryptographic devices.

Hardware-backed support must remain optional and must not require a proprietary provider or centralized identity service.

Hardware-backed protection cannot eliminate all risks from compromised devices, malicious software, or credential misuse.

## 5. Operation-Oriented Key Access

The future MOTB-8 website should not expose a persistent decrypted KeyObject as its default controller-management interface.

Instead, it should use an operation-oriented signing workflow:

    Unlock
      -> Verify Genesis
      -> Authorize Beacon operation
      -> Sign locally
      -> Clear temporary buffers
      -> Close signing context

The private key should remain accessible only for the duration necessary to perform the authorized operation.

The low-level unlockControlFile() function currently returns a Node.js KeyObject for development and integration purposes.

Higher-level website workflows should encapsulate this operation and avoid unnecessarily exposing decrypted controller credentials.

## 6. Passphrase Handling

Passphrases are sensitive credentials and require their own memory-handling controls.

Implementations should:

- Never log passphrases.
- Never persist plaintext passphrases in browser storage.
- Avoid unnecessary passphrase copies.
- Limit passphrase lifetime in application state.
- Clear mutable passphrase buffers where technically possible.
- Avoid retaining passphrases after signing operations.
- Recognize that immutable JavaScript strings cannot be reliably zeroized.

A passphrase must not be included in public Genesis Records, Beacons, or Control Files.

## 7. Private-Key Handling

Implementations should:

- Never publish private controller keys.
- Avoid unnecessary private-key serialization.
- Clear exported plaintext private-key buffers after use.
- Clear derived symmetric-key buffers after use.
- Avoid exposing decrypted keys through public application interfaces.
- Never include sensitive key material in logs, telemetry, crash reports, or analytics.
- Verify recovered controller keys against the associated Genesis Record.

The application must not claim complete memory erasure merely because controlled buffers have been overwritten.

## 8. Browser Security Requirements

Future browser-based creation and management interfaces must perform private-key operations locally.

They must not transmit decrypted controller credentials or passphrases to MOTB-8 servers.

Browser implementations should minimize sensitive data exposure to application state, extensions, third-party scripts, and persistent storage.

Strong Content Security Policy, dependency review, secure delivery, and isolation techniques should be evaluated before public deployment.

The browser implementation must be security-reviewed separately from the Node.js reference implementation.

## 9. Extensibility and Compatibility

The permanent MOTB-8 Tag must remain unchanged regardless of the selected key-protection method.

Future implementations may introduce:

- Alternative secure signing environments.
- Hardware-backed controllers.
- Non-exportable cryptographic keys.
- Additional encryption profiles.
- Controller rotation and recovery mechanisms.
- Versioned signing and key-management extensions.

These developments must remain compatible with MOTB-8's open-source, independently verifiable architecture.

No single hardware provider, cloud service, registry, blockchain, or proprietary key-management system may become a mandatory dependency solely to provide stronger key protection.

## 10. Implementation Status

Implemented:

- AES-256-GCM encrypted Control File.
- scrypt key derivation.
- Authenticated metadata.
- Genesis-bound unlocking.
- Best-effort clearing of derived encryption keys and temporary plaintext private-key buffers during encryption and decryption.

Pending:

- Further review of sensitive-buffer handling during key-derivation failures.
- Operation-oriented signing interface.
- Browser-specific key isolation.
- Isolated signing contexts.
- Hardware-backed controller support.
- Additional security review and hardening.

## 11. Governing Principle

**Protect the controller. Minimize key exposure. Verify authority. Preserve independent operation.**

MOTB-8 must prioritize secure key handling without making unsupported guarantees of complete memory erasure.


## 12. Operation-Oriented Beacon Signing

Phase 23.6 introduces an operation-oriented signing boundary through:

    src/control/sign-authorized.ts

The authorized Beacon update coordinator no longer directly receives a decrypted controller private-key object.

Instead, the coordinator:

1. Validates the previous signed Beacon.
2. Restricts changes to permitted descriptive fields.
3. Constructs the next revision.
4. Validates the unsigned successor.
5. Requests an authorized signing operation.
6. Verifies revision continuity before returning the signed Beacon.

The signing helper:

1. Validates the unsigned Beacon.
2. Confirms the Beacon references the supplied Genesis Tag.
3. Unlocks the encrypted Control File against Genesis.
4. Signs the Beacon using the recovered Ed25519 controller key.
5. Verifies the resulting signature and Genesis relationship.
6. Returns only the signed Beacon.

### Security Benefits

This architecture reduces unnecessary exposure of decrypted private-key objects to higher-level application code.

It also establishes a reusable internal boundary for future signing operations.

### Current Limitations

The signing helper operates within the same Node.js process.

The recovered KeyObject remains usable until released by the runtime.

JavaScript cannot guarantee immediate destruction of every internal copy of private-key material.

The signing helper does not independently enforce the field-level update policy, predecessor continuity, publication freshness, or conflict resolution.

Therefore, signAuthorizedBeacon() must remain an internal implementation helper rather than an unrestricted public management API.

### Future Improvements

- Short-lived isolated signing execution.
- Additional key-lifetime controls.
- Browser-specific secure signing.
- Optional hardware-backed controllers.
- Independent security review of the signing boundary.

The higher-level authorized update operation remains responsible for enforcing revision and field-change policies.

**Principle: Expose the authorized operation, not the decrypted controller key.**
