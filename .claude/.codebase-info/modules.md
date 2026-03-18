# Key Modules

*Last Updated: 2026-03-18*

## Core/Contracts/

- **Location**: `src/Core/Contracts/`
- **Purpose**: TypeScript interfaces that define the abstraction boundaries. All concrete implementations must satisfy these contracts. Enables testability via mock implementations.
- **Key files**: `ArchiveHelper.ts`, `BaseUrlManager.ts`, `EnvironmentHandler.ts`, `FileManager.ts`, `JsonParser.ts`, `OrchestratorProvider.ts`, `PageManager.ts`, `RouteManager.ts`
- **Depends on**: Nothing (pure TypeScript interfaces)
- **Exports**: Interfaces consumed by Data/, UI/, and Slices/

---

## Core/Domain/

- **Location**: `src/Core/Domain/`
- **Purpose**: Business entities, value objects, and domain models shared across slices.
- **Depends on**: Core/Language/
- **Exports**: Shared domain types used in Data/ and Slices/

---

## Data/Auth/

- **Location**: `src/Data/Auth/`
- **Purpose**: Authentication providers. Selected at startup based on `config.js` (`VITE_SHOULD_USE_AUTH`).
- **Key files**: Keycloak provider, local-auth provider, no-auth provider
- **Depends on**: `keycloak-js`, Core/Contracts/
- **Exports**: `AuthProvider` React component

---

## Data/Queries/

- **Location**: `src/Data/Queries/`
- **Purpose**: React Query hooks, query key management, and pagination utilities.
- **Key files**: `KeyFactory.ts` (standardized cache keys), `QueryControlContext.tsx` (bulk pause/resume), pagination helpers
- **Depends on**: `@tanstack/react-query`, Core/Contracts/
- **Exports**: Custom hooks for data fetching, `QueryControlProvider`

---

## Slices/* (Feature Modules)

- **Location**: `src/Slices/`
- **Purpose**: Each slice is an independent feature module owning its UI, data fetching, and domain logic. ~40 slices total.
- **Typical slice contents**:
  - `Index.tsx` — slice entry component
  - `Page.tsx` or `View.tsx` — page layout
  - `Components/` — slice-specific components
  - `Core/` — slice-local types and interfaces
  - `Data/` — slice-local React Query hooks
  - `route.ts` — route definition registered with RouteManager
- **Depends on**: Core/Contracts/, Data/Queries/, UI/Components/
- **Key slices**:

| Slice | Purpose |
|-------|---------|
| ServiceCatalog | Browse and manage the service catalog |
| ServiceInventory | View and manage service instances |
| Composer | Visual instance composition tool (JointJS+ diagrams) |
| DesiredState | Desired state version management |
| DesiredStateCompare | Diff viewer for desired state versions |
| CompileReports | View and trigger compilation reports |
| Orders | Manage orchestrator orders |
| ResourceDetails | Inspect discovered resources |
| Settings | Environment and global settings |
| Dashboard | Overview dashboard |
| Diagnose | Diagnostics tooling |

---

## UI/Components/

- **Location**: `src/UI/Components/`
- **Purpose**: Reusable, slice-agnostic React components. ~40+ component directories.
- **Key components**:

| Component | Purpose |
|-----------|---------|
| AttributesTable | Renders key-value attribute tables |
| DiffViewer | Side-by-side or inline diff display |
| EnvironmentSelector | Dropdown to switch active environment |
| ClipboardCopyButton | Copy-to-clipboard utility |
| CodeEditorControls | Toolbar for Monaco-based editors |
| CompileWidget | Trigger + status display for compilations |
| BlockingModal | Full-screen blocking modal for async ops |
| DatePicker | Date/time selection component |
| Composer/* | Visual composition canvas (JointJS+) |

- **Depends on**: PatternFly, styled-components, Core/Domain/
- **Exports**: Individual React components

---

## UI/Routing/

- **Location**: `src/UI/Routing/`
- **Purpose**: URL management, route registration, and search/state sanitization.
- **Key files**: `PrimaryBaseUrlManager.ts`, `PrimaryRouteManager.ts`, `SearchSanitizer.ts`, `PageStateSanitizer.ts`
- **Depends on**: React Router, Core/Contracts/
- **Exports**: Concrete implementations of `BaseUrlManager` and `RouteManager`

---

## UI/Root/

- **Location**: `src/UI/Root/`
- **Purpose**: Main application layout — header with environment selector, side navigation, and page frame.
- **Depends on**: UI/Routing/, UI/Components/, Slices/ (route registry)
- **Exports**: `Root` component (top-level layout)

---

## Test/

- **Location**: `src/Test/`
- **Purpose**: Shared testing utilities. Not included in production builds.
- **Key subdirs**: `Data/` (test data factories), `Mock/` (mock implementations of Core contracts), `Inject/` (DI helpers for tests), `Utils/` (common helpers)
- **Depends on**: Core/Contracts/, Vitest
- **Exports**: Test helpers imported in `*.test.tsx` files
