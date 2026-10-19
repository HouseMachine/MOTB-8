# MOTB-8 — Genesis Record Specification

**Protocol:** MOTB-8 v0.1
**Component:** Genesis & Initial Controller Binding
**Status:** Architecture approved; detailed verification rules in development

## 1. Purpose

A MOTB-8 Genesis Record establishes the cryptographic starting point for controller continuity associated with a permanent machine-presence Tag.

The Genesis Record is generated and signed locally alongside the initial Tag, controller keypair, and Beacon.

It binds the canonical MOTB-8 Tag to the initial controller public key without changing the permanent Tag format.

## 2. Constitutional Principles

- Genesis is immutable after creation.
- Genesis contains public controller verification material, never private keys.
- Genesis is signed by the initial controller using Ed25519.
- Signed content is canonicalized using RFC 8785 JCS.
- A self-signed Genesis Record does not independently prove original ownership or priority of creation.
- Independent anchoring is optional and separate from Genesis.
- No central registry, blockchain, or account system is required.
- Future controller rotation and recovery must preserve the permanent Tag.

## 3. Genesis and Anchoring Separation

The immutable Genesis Record establishes a cryptographically verifiable initial controller claim.

Optional independent anchoring evidence may be created or discovered later without modifying Genesis.

Anchoring methods must be extensible and versioned so independent implementations can develop alternative approaches.

Verification must distinguish a cryptographically valid but unanchored Genesis claim from an independently established controller binding.


## 4. Genesis Record Fields

The proposed MOTB-8 v0.1 Genesis Record contains:

| Field | Requirement | Purpose |
|---|---|---|
| `schemaVersion` | Required | Version of the Genesis Record schema |
| `motb8Tag` | Required | Permanent canonical MOTB-8 Tag |
| `createdAt` | Required | UTC timestamp of Genesis creation |
| `controller` | Required | Initial controller public-key information |
| `proof` | Required | Cryptographic signature over the Genesis Record |

### Controller Object

The initial controller uses the previously locked Beacon-compatible structure:

- `id`: `#controller-1`
- `type`: `Ed25519`
- `publicKeyJwk.kty`: `OKP`
- `publicKeyJwk.crv`: `Ed25519`
- `publicKeyJwk.x`: Base64url-encoded Ed25519 public key

The controller object must never contain private-key material.

### Proof Object

The proposed Genesis proof contains:

- `type`: Signature method identifier, to be finalized.
- `verificationMethod`: Reference to the signing controller.
- `canonicalization`: `RFC8785-JCS`.
- `signature`: Base64url-encoded Ed25519 signature.

The exact proof type and signing-input rules must be finalized before implementation.

### Immutability

The Genesis Record must not be modified after signing.

Later controller rotation, recovery, or independent anchoring must use separate records or extensions rather than modifying the original Genesis Record.


## 5. Genesis Signing and Verification

### Signing Procedure

1. Construct the Genesis Record containing `schemaVersion`, `motb8Tag`, `createdAt`, and `controller`.
2. Validate the canonical MOTB-8 Tag grammar and checksum.
3. Validate the Ed25519 controller public-key structure.
4. Canonicalize the Genesis Record excluding the entire `proof` property using RFC 8785 JCS.
5. Encode the canonicalized JSON as UTF-8 bytes.
6. Sign those bytes using the initial controller's locally held Ed25519 private key.
7. Attach the `proof` object containing the signature and verification-method information.

The private key must never be included in the public Genesis Record.

### Verification Procedure

1. Validate the Genesis Record schema.
2. Validate the MOTB-8 Tag grammar and checksum.
3. Validate the controller public-key structure.
4. Confirm that `proof.verificationMethod` references the declared controller.
5. Remove the entire `proof` property from the verification input.
6. Canonicalize the remaining record using RFC 8785 JCS.
7. Encode the canonicalized JSON as UTF-8 bytes.
8. Verify the Ed25519 signature against the declared controller public key.

A successful signature verification establishes that the record was signed by the private key corresponding to the declared public key.

It does not independently establish that this controller was the original creator of the Tag.

### Signing Boundary

The Genesis signature covers the Tag, creation timestamp, schema version, and initial controller information.

Optional external anchoring evidence is not part of the immutable Genesis signing payload.


## 6. Genesis Verification Result States

MOTB-8 verification must distinguish cryptographic validity from independently established controller binding.

### VALID_UNANCHORED

The Genesis Record passes schema, Tag, controller-key, and signature validation, but no accepted independent anchoring evidence establishes the initial controller binding.

This is a cryptographically valid self-asserted controller claim, not proof of original Tag ownership.

### VALID_ANCHORED

The Genesis Record passes cryptographic validation and an explicitly identified independent anchoring method provides accepted evidence supporting the controller binding.

The verification result must identify the anchoring method and relevant evidence. Anchoring does not automatically establish legal ownership or operator identity.

### CONFLICTING

Two or more incompatible Genesis/controller-binding claims are observed for the same canonical MOTB-8 Tag.

A verifier must not silently select one claim as authoritative merely because it was encountered first.

Conflicting evidence must be reported for further evaluation.

### INVALID

The Genesis Record fails required structural, canonical Tag, public-key, or cryptographic signature validation.

Invalid records must not establish controller authority.

### UNRESOLVED

The verifier cannot obtain or sufficiently evaluate the Genesis Record or required verification evidence.

Unresolved does not automatically mean invalid or malicious.

### Verification Principles

- Signature validity and independent binding authority are separate determinations.
- A self-signed Genesis Record alone does not prove original ownership.
- First-observed publication is not automatically authoritative.
- Independent anchoring methods must be explicitly identified and versioned.
- Unknown anchoring methods must not be silently treated as trusted.
- Verification results must not imply machine safety, legitimacy, reputation, or MOTB-8 endorsement.
- Future verification extensions may add evidence without changing the permanent Tag or immutable Genesis Record.

