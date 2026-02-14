# Architecture Overview

Core modules
- domain/: game state, rules, scoring (pure functions, unit-tested)
- services/: adapters (DB, in-memory store, WebSocket)
- web/: HTTP handlers, CLI, and integration wiring
- tests/: unit and integration tests

Data flow (short)
1. Player interacts with client → WebSocket / HTTP
2. Handler validates and calls domain reducer in src/domain/
3. Updated state is persisted by a service and broadcast to players
4. Clients receive updates and re-render UI
5. Tests cover domain logic in isolation and integration tests cover end-to-end flows
6. Codegen ensures type safety between GraphQL API and domain models
7. Strict TypeScript settings prevent runtime type errors and ensure all public APIs are fully typed

Frontend entry points
- Landing page provides a basic sign-in form (name + email) with a role selector
- Admin role exposes quiz creation and editing routes
- Player role exposes quiz join routes
- UI role selection is client-only and does not persist yet

Important invariants
- Session IDs are UUIDv4 strings
- Domain reducers must never mutate inputs
- All public domain APIs are fully typed and have unit tests
- GraphQL schema is the source of truth for API types, and codegen keeps it in sync with domain models
