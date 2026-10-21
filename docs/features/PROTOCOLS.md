# MOTB-8 Feature — Protocols

## Make Your Machine Discoverable

MOTB-8 Protocol declarations help people, machines,
and discovery services understand how a machine
may be contacted or integrated.

A protocol declaration describes supported
communication methods and associated endpoints.

It does not authorize access or execution.

## 1. What Are Protocol Declarations?

Protocols are optional, machine-readable entries
within the signed MOTB-8 Beacon.

They describe the communication standards,
interfaces, or integration methods a machine
declares it supports.

MOTB-8 does not require a specific protocol.

## 2. Protocol Structure

Each declaration supports:

- `id`: Required protocol identifier.
- `version`: Optional protocol version.
- `endpoints`: Optional array of endpoint URIs.
- `documentation`: Optional documentation URI.

Multiple protocol declarations are permitted.

## 3. Protocol Neutrality

Developers may declare established, emerging,
or independently developed protocols.

Examples include HTTP APIs, WebSockets,
MCP, A2A, and custom machine protocols.

These examples are illustrative, not a
mandatory or exhaustive protocol list.

## 4. Interoperability

A machine may declare multiple protocols and
multiple endpoints for each protocol.

This allows different machines and applications
to discover compatible interaction methods.

Protocol declarations do not require Monet,
a centralized gateway, or a specific provider.

## 5. Security and Authorization

Protocol declarations are included in the
signed MOTB-8 Beacon.

A valid signature protects the integrity of
the declared protocol information.

It does not prove endpoint availability,
security, compatibility, or operator legitimacy.

A published endpoint does not grant permission
to invoke operations or access protected resources.

Consumers must independently enforce appropriate
authentication, authorization, and network security.

## 6. Extensibility

Developers may introduce custom protocol identifiers.

Protocol declarations may evolve through authorized
Beacon revisions without changing the permanent Tag.

MOTB-8 does not maintain a mandatory closed
list of supported protocols.

## 7. Benefits

### For Developers

Declare supported communication protocols
without requiring a particular integration platform.

### For Machine Operators

Make interaction methods and technical
documentation discoverable.

### For Other Machines

Identify potentially compatible protocols
and endpoints before attempting integration.

### For the Broader Ecosystem

Support interoperability among independently
developed machines, services, and networks.

## 8. Governing Principle

Declare how a machine can communicate
without prescribing how it must communicate.

MOTB-8 — Make Your Machine Discoverable.
