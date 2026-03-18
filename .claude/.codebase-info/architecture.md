# Architecture Overview

*Last Updated: 2026-03-18*

## Executive Summary

Inmanta Web Console is a feature-rich React/TypeScript SPA that serves as the management UI for the Inmanta Orchestrator platform. It communicates with a backend orchestrator API (running on port 8888 by default) via REST and GraphQL, and supports multiple authentication modes (no-auth, Keycloak, local-auth).

The codebase is organized into three main layers — Core (domain contracts), Data (API/state management), and UI (presentation) — plus 40+ feature slices (Slices/) that each own their domain's components, queries, and logic. Dependencies are wired at startup through a centralized dependency injection system in `src/Injector.tsx`.

## High-Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                           │
│                                                                │
│  src/index.tsx                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ErrorBoundary                                           │  │
│  │  └─ QueryControlProvider                                 │  │
│  │     └─ QueryClientProvider (React Query)                 │  │
│  │        └─ CustomRouter (React Router v7)                 │  │
│  │           └─ AuthProvider (Keycloak / local / none)      │  │
│  │              └─ Injector.tsx (DI wiring)                 │  │
│  │                 └─ DependencyProvider                    │  │
│  │                    └─ Root (layout + routes)             │  │
│  │                       └─ Slices/** (feature pages)       │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
         │ REST/GraphQL (proxied via /api, /lsm)
         ▼
┌─────────────────────┐
│  Inmanta Orchestrator│
│  Backend (port 8888) │
└─────────────────────┘
```

## Layered Architecture

```
┌──────────────────────────────────────────┐
│         UI/  (Presentation)              │
│  Components/, Root/, Routing/, Styles/   │
├──────────────────────────────────────────┤
│         Slices/  (Feature Modules)       │
│  40+ feature directories, each with:    │
│  UI components, React Query hooks,       │
│  domain types, route definitions         │
├──────────────────────────────────────────┤
│         Data/  (Data Access)             │
│  Auth/, Queries/, Parsers/, Common/      │
├──────────────────────────────────────────┤
│         Core/  (Domain)                  │
│  Contracts/ (interfaces), Domain/        │
│  (entities), Language/ (utilities)       │
└──────────────────────────────────────────┘
```

## Component Relationships

- **Injector.tsx** wires all concrete implementations to their abstract contracts (interfaces from `Core/Contracts/`) and exposes them via `DependencyProvider` context.
- **Feature slices** consume dependencies via `useDependencies()` hook and use React Query hooks (from `Data/Queries/`) for server state.
- **Routing** is managed by `PrimaryRouteManager` and `PrimaryBaseUrlManager` which handle URL construction and navigation across environments.
- **Authentication** wraps all routes; the auth provider is selected at boot time from `config.js` settings (`VITE_SHOULD_USE_AUTH`).

## Communication Patterns

- **REST API**: All orchestrator data fetching via HTTP to proxied `/api` and `/lsm` paths.
- **GraphQL**: Used for specific queries via `graphql-request`.
- **React Query**: Centralized server state caching, polling, and invalidation (`Data/Queries/`).
- **Context API**: Dependency injection, auth state, modal state, and query control are passed down via React context.
- See `communication.md` for details.
