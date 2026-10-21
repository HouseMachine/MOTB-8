# MOTB-8 Feature — Attachments

## Make Your Machine Discoverable

MOTB-8 Attachments allow developers to extend the
information associated with a machine presence without
changing its permanent identity or core protocol.

Attachments are optional, typed, versioned objects
included in the signed MOTB-8 Beacon.

## 1. Attachment Structure

Each attachment contains three required fields:

- `type`: Identifies the attachment type.
- `version`: Identifies its format version.
- `data`: Contains structured JSON information.

The `data` field must be a JSON object.

## 2. Developer-Defined Extensions

Developers may create attachment types for their
specific machines, industries, and applications.

Examples include:

- Robotics and sensor profiles.
- AI model information.
- Machine operating requirements.
- Technical compatibility metadata.
- Industry-specific discovery information.

No central approval is required to define an
attachment type.

## 3. Versioning

Each attachment declares its own format version.

Attachment versioning is independent of Beacon
schema versions and Beacon revision numbers.

Attachment formats may evolve without changing
the permanent MOTB-8 Tag.

## 4. Unknown Attachment Types

Unknown attachment types may pass structural
validation without being considered trusted.

Consumers should interpret only formats they support.

Unknown attachments must not automatically trigger
privileged actions or executable instructions.

## 5. Cryptographic Integrity

Attachments are included in the signed Beacon.

Changing signed attachment data invalidates the
existing Beacon signature.

Authorized changes require a newly signed Beacon
revision.

A valid signature establishes data integrity under
the associated Genesis controller binding.

It does not independently prove that attachment
information is accurate, legitimate, or safe.

## 6. Security Considerations

Attachment data must be treated as untrusted input.

Implementations should enforce limits on:

- Number of attachments.
- Serialized data size.
- JSON nesting depth.
- Processing time and memory consumption.

Signed attachments must never be treated as
automatically trusted executable instructions.

## 7. Ecosystem Independence

Attachments do not require Monet, iEthereum,
a centralized registry, or a commercial platform.

Developers may publish independent attachment
formats and supporting documentation.

## 8. Benefits

### For Developers

Extend machine descriptions without modifying
the core MOTB-8 protocol.

### For Machine Operators

Publish specialized technical information
associated with a permanent machine identity.

### For Other Machines

Access structured information that supports
discovery, compatibility assessment, and
interaction planning.

### For the Broader Ecosystem

Encourage independently developed and interoperable
machine-description formats.

## 9. Governing Principle

Extend the machine's description without
changing its permanent identity.

MOTB-8 — Make Your Machine Discoverable.
