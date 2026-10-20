# MOTB-8 — Control File Cryptography

**Phase:** 23.5
**Protocol Release:** v0.1
**Status:** Proposed parameters approved for implementation; testing pending

## 1. Purpose

Define the cryptographic algorithms, parameters, and security requirements for protecting locally stored MOTB-8 controller private keys.

The Control File is encrypted locally and must never require a centralized account, server-held private key, or proprietary key-management service.

## 2. Cryptographic Parameters

| Setting | v0.1 Value |
|---|---|
| Encryption | AES-256-GCM |
| Key derivation | scrypt |
| scrypt N | 32,768 |
| scrypt r | 8 |
| scrypt p | 1 |
| Salt | 16 cryptographically random bytes |
| Nonce | 12 cryptographically random bytes |
| Authentication tag | 16 bytes |
| Derived encryption key | 32 bytes |
| Private-key format | PKCS#8 DER, encrypted inside the payload |

## 3. Encryption Requirements

- Generate a new random salt and nonce for every encryption operation.
- Derive the 256-bit encryption key using scrypt.
- Configure sufficient memory for the selected scrypt parameters.
- Encrypt the private-key payload using AES-256-GCM.
- Authenticate protected Control File metadata using Additional Authenticated Data (AAD).
- Never store the passphrase or derived encryption key in the Control File.
- Never publish the unencrypted controller private key.

## 4. Decryption Requirements

- Validate the Control File format and version.
- Reject unsupported or unsafe cryptographic parameters.
- Reconstruct the authenticated metadata deterministically.
- Derive the encryption key from the operator's passphrase.
- Verify the AES-GCM authentication tag.
- Reject incorrect passphrases, modified ciphertext, or tampered authenticated metadata.
- Validate the recovered private key against the expected controller public key and MOTB-8 identity.

## 5. Cryptographic Agility

Future versions may introduce alternative encryption algorithms, key-derivation methods, or stronger parameter profiles.

Changes must be explicitly versioned and must not alter the permanent MOTB-8 Tag.

Independent implementations must be able to identify supported formats and reject unsupported ones safely.

## 6. Security Limitations

Encryption protects private-key material at rest. It does not independently establish original ownership of a MOTB-8 Tag.

Security also depends on the strength of the operator's passphrase, the security of their device, and appropriate backup practices.

The selected scrypt parameters are initial v0.1 defaults and should undergo implementation testing and security review before public release.

## 7. Related Specification

See `docs/specification/CONTROL-FILE.md` for the complete Control File architecture, authenticated metadata, management workflow, and recovery limitations.
