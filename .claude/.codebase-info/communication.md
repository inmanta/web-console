# Communication Patterns

*Last Updated: 2026-03-18*

## Overview Diagram

```
 Browser SPA
     │
     ├── REST /api/*  ──────────────────► Inmanta Orchestrator :8888
     │   (proxied by Vite in dev)         (core API)
     │
     ├── REST /lsm/*  ──────────────────► Inmanta Orchestrator :8888
     │   (Lifecycle Service Manager)       (LSM module)
     │
     ├── GraphQL /lsm/v1/... ───────────► Inmanta Orchestrator :8888
     │   (via graphql-request)
     │
     └── Keycloak :8080 (optional) ─────► Auth server (OIDC/OAuth2)
```

## API Contracts

### Proxy Configuration (Vite dev)

| Path | Target | Purpose |
|------|--------|---------|
| `/api` | `localhost:8888` | Core Inmanta REST API |
| `/lsm` | `localhost:8888` | Lifecycle Service Manager API |

### Authentication Headers

- **Keycloak mode**: Bearer token injected into requests via Keycloak JS adapter.
- **Local auth mode**: Session token from login endpoint.
- **No auth**: No headers required.

### URL Management

- `PrimaryBaseUrlManager` (`src/UI/Routing/`) builds base API URLs.
- `urlManager` (injected via DI) constructs specific endpoint URLs.
- Environment context is prepended to API calls (multi-tenancy support).

### GraphQL

- Used via `graphql-request` library.
- Queries in `src/Data/Queries/` or within feature slices.

## Events & Messaging

- No event bus or WebSocket connections observed.
- **React Query** handles all server-state polling, caching, and cache invalidation:
  - `gcTime: 5000` (garbage collect after 5s)
  - `retry: false` (no automatic retries)
  - `KeyFactory` in `src/Data/Queries/` standardizes query cache keys.
- **QueryControlContext** (`src/Data/Queries/`) manages bulk query operations (pause/resume polling, force refetch).

## External Integrations

| Service | Purpose | Config |
|---------|---------|--------|
| Inmanta Orchestrator | Primary backend (REST + GraphQL) | `src/config.js` (`VITE_API_BASEURL`) |
| Keycloak | OIDC authentication | `src/config.js` (realm, url, clientId) |
| Monaco Editor CDN workers | Language workers for code editing | `src/monaco-workers.ts` |

## config.js (Runtime Configuration)

Loaded at runtime from `public/config.js` (copied to `dist/` at build). Not bundled — allows deployment-time configuration without rebuilding.

Key fields:

| Variable | Purpose |
|----------|---------|
| `VITE_SHOULD_USE_AUTH` | Auth mode: `"keycloak"`, `"local-auth"`, or falsy for none |
| `VITE_API_BASEURL` | Base URL for the orchestrator backend |
| Keycloak fields | `realm`, `url`, `clientId` |
