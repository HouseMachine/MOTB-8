# MOTB-8 — Control File Developer Guide

**Phase:** 23.5
**Version:** v0.1
**Status:** Core encryption implemented; website integration pending

## 1. What Is a Control File?

The MOTB-8 Control File is an encrypted local file containing the private controller credentials needed to manage a machine presence.

It allows an operator to retain control without creating a username/password account or relying on a server to store private keys.

The Control File is private. The MOTB-8 Tag, Genesis Record, and signed Beacon are public.

## 2. Why You Must Save It

Your permanent MOTB-8 Tag identifies your machine presence.

Your controller private key allows you to sign authorized Beacon changes.

The encrypted Control File protects that private key while stored.

Without access to the correct private key, you may be unable to update your machine's Beacon.

## 3. What Happens During Creation?

The intended website workflow is:

1. Generate your permanent MOTB-8 Tag.
2. Generate your controller keypair locally.
3. Create the signed Genesis Record and Beacon.
4. Choose a strong Control File passphrase.
5. Encrypt your controller private key locally.
6. Download and securely save your encrypted Control File.
7. Create a secure backup before leaving the creation process.

The complete website workflow is not yet implemented.

## 4. Where Should You Store It?

Recommended practices:

- Keep the encrypted Control File in a secure, backed-up location.
- Maintain a separate backup in another secure location.
- Use a strong, unique passphrase.
- Store the passphrase in a reputable password manager or another secure location.
- Avoid storing the passphrase alongside the Control File in plaintext.
- Never upload the Control File to public repositories or publish it with the Beacon.

Although encrypted, the Control File should still be treated as sensitive.

## 5. How Will You Manage Your Machine Later?

The planned management process is:

1. Open the MOTB-8 management interface.
2. Select your encrypted Control File.
3. Enter your unlocking passphrase.
4. Decrypt the controller credentials locally.
5. Verify the recovered controller against the Genesis Record.
6. Edit the permitted Beacon information.
7. Sign the updated Beacon locally.
8. Publish the updated public Beacon.

The permanent Tag and original Genesis Record remain unchanged.

## 6. What If You Lose the File?

If you lose your Control File but retain a secure backup, you can use the backup.

If you lose the passphrase, the file may become permanently inaccessible.

If you lose all usable copies of the private controller key, you may lose the ability to authorize Beacon updates.

MOTB-8 does not currently provide centralized password resets or guaranteed key recovery.

## 7. What Can You Share?

Public information:

- Permanent MOTB-8 Tag.
- Signed Genesis Record.
- Signed Beacon.
- Public discovery and capability metadata.

Private information:

- Controller private key.
- Control File passphrase.
- Decrypted controller credentials.
- Encrypted Control File.

Do not publish private information.

## 8. Current Technical Implementation

Implemented and tested:

- Local Ed25519 controller generation.
- AES-256-GCM Control File encryption.
- scrypt passphrase-based key derivation.
- Authenticated metadata protection.
- Control File decryption.
- Genesis-bound controller verification.

Still pending:

- Website-based creation and management.
- Browser-native encryption and secure download.
- Complete Beacon creation and update workflow.
- Advanced recovery and controller rotation.
- Additional security hardening.

## 9. Security Reminder

A valid Control File proves access to the corresponding private controller key when successfully unlocked and verified.

It does not independently establish original ownership of a public MOTB-8 Tag.

**Guiding principle: Keep your Control File private. Keep your Tag public. Protect your controller key.**
