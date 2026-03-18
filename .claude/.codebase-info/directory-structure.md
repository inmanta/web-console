# Directory Structure

*Last Updated: 2026-03-18*

## Root Layout

```
web-console/
├── src/                    # Main application source
│   ├── Core/               # Domain contracts and entities
│   ├── Data/               # Data access layer
│   ├── Slices/             # Feature modules (40+)
│   ├── UI/                 # Presentation layer
│   ├── Test/               # Test utilities and mocks
│   ├── index.tsx           # App entry point
│   ├── Injector.tsx        # Dependency injection wiring
│   ├── config.js           # Runtime configuration
│   └── monaco-workers.ts   # Monaco editor worker registration
├── cypress/                # E2E tests
│   ├── e2e/                # Test scenarios
│   ├── support/            # Custom commands and helpers
│   └── fixtures/           # Static test data
├── __mocks__/              # Module mocks for unit tests
├── public/                 # Static assets served as-is
│   └── images/
├── docs/                   # Developer documentation
├── shell-scripts/          # Dev environment setup scripts
├── dist/                   # Build output (git-ignored)
├── node_modules/           # Installed packages (git-ignored)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts        # (or inline in vite.config.ts)
├── cypress.config.cjs
├── eslint.config.js
├── .prettierrc.cjs
├── Jenkinsfile             # CI/CD pipeline
└── index.html              # SPA shell
```

## Key Directories Explained

### src/Core/

Domain layer — pure contracts and entities with no framework dependencies.

```
Core/
├── Contracts/    # TypeScript interfaces: ArchiveHelper, BaseUrlManager,
│                 # EnvironmentHandler, FileManager, JsonParser,
│                 # OrchestratorProvider, PageManager, RouteManager
├── Domain/       # Business entities and domain models
└── Language/     # Language utilities and type extensions
```

### src/Data/

Data access layer — all API communication and server state management.

```
Data/
├── Auth/         # Authentication providers (Keycloak, local, none)
├── Common/       # Shared data utilities
├── Parsers/      # JSON/YAML parsing logic
└── Queries/      # React Query hooks, KeyFactory, pagination helpers,
                  # QueryControlContext (bulk query operations)
```

### src/Slices/

Feature modules — each slice owns its UI, queries, and domain logic. Examples:

```
Slices/
├── Dashboard/
├── Home/
├── Login/
├── ServiceCatalog/
├── ServiceInventory/
├── ServiceDetails/
├── CreateInstance/
├── EditInstance/
├── DuplicateInstance/
├── DesiredState/
├── DesiredStateCompare/
├── DesiredStateDetails/
├── ResourceDetails/
├── ResourceDiscovery/
├── Orders/
├── Composer/               # Visual instance composition tool
├── CompileReports/
├── CompileDetails/
├── Events/
├── Facts/
├── Parameters/
├── Settings/
├── Status/
├── Diagnose/
├── Notification/
├── MarkdownPreview/
└── ... (20+ more)
```

### src/UI/

Presentation layer — layout, reusable components, routing setup.

```
UI/
├── Components/             # 40+ reusable component directories
│   ├── ActionDisabledTooltip/
│   ├── AttributesTable/
│   ├── BlockingModal/
│   ├── ClipboardCopyButton/
│   ├── CodeEditorControls/
│   ├── CompileWidget/
│   ├── DiffViewer/
│   ├── EnvironmentSelector/
│   ├── DatePicker/
│   ├── Composer/           # Visual design tool components
│   └── ... (30+ more)
├── Root/                   # Main layout (header, nav, PageFrame)
├── Routing/                # Route management
│   ├── PrimaryBaseUrlManager.ts
│   ├── PrimaryRouteManager.ts
│   ├── SearchSanitizer.ts
│   └── PageStateSanitizer.ts
├── Styles/                 # Global CSS / theming
├── Dependency/             # DependencyProvider context
└── Utils/                  # Shared UI utilities and hooks
```

### src/Test/

Utilities for unit testing — not shipped in production build.

```
Test/
├── Data/       # Test data factories
├── Mock/       # Mock implementations of Core contracts
├── Inject/     # DI helpers for tests
└── Utils/      # Common test helper functions
```

### cypress/e2e/

E2E test scenarios mapped to major application features:

```
e2e/
├── scenario-1-environment.cy.js     # Environment management
├── scenario-2.1-*.cy.js             # Service creation flows
├── scenario-3-*.cy.js               # Service details
├── scenario-4-*.cy.js               # Desired state
├── scenario-5-*.cy.js               # Compile reports
├── scenario-6-*.cy.js               # Resources
├── scenario-8-*.cy.js               # Composer
└── scenario-9-*.cy.js               # Orders
```
