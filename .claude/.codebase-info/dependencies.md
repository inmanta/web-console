# Dependencies

*Last Updated: 2026-03-18*

## Production Dependencies

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.2.4 | UI framework |
| react-dom | 19.2.4 | DOM rendering |
| react-router | 7.12.0 | Client-side routing |
| @tanstack/react-query | 5.90.21 | Server state management |

### UI Component Library

| Package | Version | Purpose |
|---------|---------|---------|
| @patternfly/react-core | 6.x | Red Hat design system components |
| @patternfly/react-icons | 6.x | Icon set |
| @patternfly/react-table | 6.x | Data table components |
| @patternfly/react-log-viewer | 6.x | Log display component |
| @patternfly/react-code-editor | 6.x | Code editor wrapper |
| styled-components | 6.1.19 | CSS-in-JS component styling |

### Code Editing & Visualization

| Package | Version | Purpose |
|---------|---------|---------|
| @monaco-editor/react | 4.7.0 | Monaco editor React wrapper |
| monaco-editor | 0.52.2 | VSCode-based code editor |
| @joint/plus | 4.2.3 | JointJS+ diagramming/graph visualization |
| mermaid | 11.12.3 | Text-based diagram rendering |

### Authentication

| Package | Version | Purpose |
|---------|---------|---------|
| keycloak-js | 26.2.1 | Keycloak OIDC/OAuth2 client |

### Data & API

| Package | Version | Purpose |
|---------|---------|---------|
| graphql-request | 7.3.0 | Lightweight GraphQL client |
| graphql | 16.11.0 | GraphQL runtime |
| moment | 2.30.1 | Date/time parsing and formatting |
| moment-timezone | 0.5.48 | Timezone support |

### Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| lodash-es | 4.17.21 | Utility functions (ES module build) |
| uuid | 11.1.0 | UUID generation |
| js-yaml | 4.1.0 | YAML parsing/serialization |
| diff | 8.0.2 | Text diff computation |
| react-diff-viewer-continued | 4.0.0 | Diff display component |
| deepmerge | 4.3.1 | Deep object merging |

---

## Development Dependencies

### Build Tool

| Package | Version | Purpose |
|---------|---------|---------|
| vite | 7.3.1 | Dev server and bundler |
| @vitejs/plugin-react | latest | React fast refresh + JSX |
| typescript | 5.9.3 | TypeScript compiler |

### Testing

| Package | Version | Purpose |
|---------|---------|---------|
| vitest | 4.0.18 | Unit/integration test runner |
| @testing-library/react | latest | React component testing utilities |
| @testing-library/jest-dom | latest | Custom DOM matchers |
| @testing-library/user-event | latest | User interaction simulation |
| cypress | 15.10.0 | E2E testing framework |
| @cypress/react | latest | Cypress React component testing |

### Linting & Formatting

| Package | Version | Purpose |
|---------|---------|---------|
| eslint | 9.30.1 | JavaScript/TypeScript linter |
| @typescript-eslint/parser | latest | TypeScript ESLint parser |
| eslint-plugin-react | latest | React-specific lint rules |
| eslint-plugin-react-hooks | latest | Hooks lint rules |
| eslint-plugin-import | latest | Import ordering/validation |
| prettier | 3.6.2 | Code formatter |
| madge | latest | Circular dependency detection |

## Dependency Notes

- **JointJS Plus** (`@joint/plus`) is a commercial library — requires a license for production use.
- **lodash-es** is used instead of `lodash` for proper tree-shaking in ESM builds.
- **Patternfly 6.x** is the Red Hat design system; major version upgrades often require component API changes.
- **React 19** is the latest major version; concurrent features are available.
- **yarn@4.1.0** (Berry) is the package manager — uses `node_modules` linker, not PnP.
