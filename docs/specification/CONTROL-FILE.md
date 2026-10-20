# MOTB-8 — Encrypted Control File Specification

**Phase:** 23.5
**Version:** v0.1
**Status:** Proposed encryption format; implementation pending

## 1. Purpose

The MOTB-8 Control File allows an operator to securely retain the private controller credentials associated with a permanent MOTB-8 machine presence.

The Control File supports local decryption and future authorized Beacon management without requiring conventional user accounts or server-held private keys.

## 2. Security Principles

- Controller private keys are generated locally.
- Private keys are encrypted before persistent storage.
- Decryption occurs locally.
- The operator controls the passphrase and backups.
- No server is required to store or recover private keys.
- The Control File is private, not a public discovery resource.
- Losing both the private key and recoverable backups may permanently prevent authorized updates.

## 3. Proposed Cryptographic Format

Encryption: AES-256-GCM.

Key derivation: scrypt with a random salt and explicitly recorded parameters.

Nonce: 12 cryptographically random bytes per encryption.

Authentication tag: 16 bytes.

Encoding: Base64url for binary fields.

The encryption key is derived from the operator's passphrase and is never stored in the Control File.

Authenticated encryption must detect incorrect passphrases, modified ciphertext, and tampered authenticated metadata.

## 4. Proposed File Structure

The encrypted file contains:

- format: MOTB-8 Control File identifier.
- version: Control File format version.
- motb8Tag: Associated permanent public Tag.
- kdf: Key derivation algorithm, salt, and parameters.
- encryption: Encryption algorithm, nonce, and authentication tag.
- ciphertext: Encrypted private controller material.

The public Tag is metadata, not a secret.

The private controller key must exist only inside the encrypted payload.

## 5. Private Payload

After successful local decryption, the payload must identify the controller private key and its associated public key.

The software must verify that the decrypted private key corresponds to the declared controller and associated MOTB-8 identity.

The exact private-key serialization and metadata-binding rules will be finalized before implementation.

## 6. Management Workflow

1. Select the encrypted Control File.
2. Enter the local unlocking passphrase.
3. Decrypt the controller credentials locally.
4. Validate the decrypted controller key.
5. Confirm the associated MOTB-8 Tag and Genesis controller binding.
6. Authorize the requested Beacon operation.
7. Re-sign updated Beacon information locally.

## 7. Backup and Recovery

Operators should securely back up the encrypted Control File and retain their unlocking passphrase separately.

MOTB-8 cannot guarantee recovery if both the controller key and usable backups are lost.

Future controller recovery and rotation mechanisms may be introduced through separately versioned extensions.

## 8. Public Website Education

The MOTB-8 website must explain:

- What the Control File protects.
- Why the operator must save it.
- How to unlock it locally.
- Where to keep secure backups.
- Why the private key must never be published.
- What happens if the Control File or passphrase is lost.

**Guiding principle:** The operator controls the key. MOTB-8 verifies the proof.

## 9. v0.1 Cryptographic Parameters

The initial implementation uses:

| Parameter | Value |
|---|---|
| Encryption algorithm | AES-256-GCM |
| Key derivation | scrypt |
| scrypt N | 32768 |
| scrypt r | 8 |
| scrypt p | 1 |
| Derived key length | 32 bytes |
| Salt length | 16 bytes |
| Nonce length | 12 bytes |
| Authentication tag length | 16 bytes |
| Private key serialization | PKCS#8 DER |

All salts and nonces must be generated using a cryptographically secure random-number generator.

A new random salt and nonce must be generated for every encryption operation.

The implementation must explicitly configure sufficient memory for scrypt and reject unsupported or unsafe parameter values during decryption.

## 10. Authenticated Metadata

AES-GCM Additional Authenticated Data (AAD) must bind the encrypted payload to the Control File's public metadata, including:

- File format and version.
- Canonical MOTB-8 Tag.
- Key-derivation algorithm and parameters.
- Encryption algorithm and nonce.

AAD serialization must be deterministic and documented.

Modification of authenticated metadata must cause decryption to fail.

The authentication tag must be verified before decrypted private-key material is accepted.


## 11. Genesis-Bound Unlocking

The Control File supports local unlocking against a supplied, cryptographically verified Genesis Record.

The unlocking procedure:

1. Verifies the supplied Genesis Record.
2. Confirms that the Control File and Genesis reference the same permanent MOTB-8 Tag.
3. Decrypts the Control File using the operator's passphrase.
4. Reconstructs the Ed25519 controller private key.
5. Derives the corresponding public key.
6. Confirms that the recovered public key matches the Genesis controller public key.
7. Returns the recovered key for authorized local signing operations.

The current implementation accepts cryptographically valid, unanchored Genesis records.

This establishes key consistency with the supplied Genesis Record, not independently proven original ownership.

### Security and Recovery Limitations

- The operator must securely retain the encrypted Control File and unlocking passphrase.
- The encrypted file is not a substitute for secure backups.
- The private key must never be published.
- A compromised device or stolen passphrase may expose controller credentials.
- Lost credentials may prevent future authorized Beacon updates.
- Independent Genesis anchoring and advanced controller recovery remain future work.

## 12. Implementation Status

Implemented and tested:

- AES-256-GCM encryption and decryption.
- scrypt key derivation using the documented v0.1 parameters.
- Fresh random salts and nonces.
- RFC 8785 JCS authenticated metadata.
- Structural Control File validation.
- Incorrect-passphrase and tampering rejection.
- Genesis-bound controller key verification.

Pending:

- Public website Control File download and upload workflow.
- Secure browser-side key handling and file management.
- Complete Beacon creation and update workflow.
- Additional cryptographic hardening and security review.
- Advanced controller recovery and rotation.
