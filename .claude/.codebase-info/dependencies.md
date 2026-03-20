# Dependencies

*Last Updated: 2026-03-20*

## Production Dependencies

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.2.4 | UI framework |
| react-dom | 19.2.4 | DOM rendering |
| react-router | 7.12.0 | Client-side routing |
| @tanstack/react-query | 5.90.21 | Server state management |
| @loadable/component | 5.16.7 | Code splitting / lazy loading |

### UI Component Library

| Package | Version | Purpose |
|---------|---------|---------|
| @patternfly/react-core | 6.2.2 | Red Hat design system components |
| @patternfly/react-icons | 6.4.0 | Icon set |
| @patternfly/react-table | 6.3.1 | Data table components |
| @patternfly/react-log-viewer | 6.3.0 | Log display component |
| @patternfly/react-code-editor | 6.4.1 | Code editor wrapper |
| @patternfly/react-charts | 8.3.1 | Chart components |
| @patternfly/react-styles | 6.4.0 | Style utilities |
| @patternfly/react-tokens | 6.4.0 | Design tokens |
| styled-components | 6.1.19 | CSS-in-JS component styling |
| react-icons | 5.5.0 | Additional icon library |
| victory | 37.3.6 | Data visualization charts |

### Code Editing & Visualization

| Package | Version | Purpose |
|---------|---------|---------|
| @monaco-editor/react | 4.7.0 | Monaco editor React wrapper |
| monaco-editor | 0.52.2 | VSCode-based code editor |
| @joint/plus | 4.2.3 | JointJS+ diagramming/graph visualization |
| @joint/layout-directed-graph | 4.2.3 | Graph layout algorithms for Composer |
| mermaid | 11.12.3 | Text-based diagram rendering |

### Authentication

| Package | Version | Purpose |
|---------|---------|---------|
| keycloak-js | 26.2.1 | Keycloak OIDC/OAuth2 client |
| @react-keycloak/web | 3.4.0 | React integration for Keycloak |

### Data & API

| Package | Version | Purpose |
|---------|---------|---------|
| graphql-request | 7.3.0 | Lightweight GraphQL client |
| graphql | 16.13.0 | GraphQL runtime |
| moment | 2.30.1 | Date/time parsing and formatting |
| moment-timezone | 0.6.0 | Timezone support |
| qs | 6.14.2 | Query string parsing/serialization |

### Content & Formatting

| Package | Version | Purpose |
|---------|---------|---------|
| markdown-it | 14.1.1 | Markdown parser |
| highlight.js | 11.11.1 | Syntax highlighting |
| xml-formatter | 3.6.7 | XML formatting/pretty-print |
| react-diff-viewer-continued | 3.4.0 | Diff display component |

### Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| lodash-es | 4.17.21 | Utility functions (ES module build) |
| uuid | 13.0.0 | UUID generation |
| bignumber.js | 9.3.1 | Arbitrary precision numbers |
| copy-to-clipboard | 3.3.3 | Clipboard write utility |
| file-saver | 2.0.5 | Save files to user's device |
| react-dropzone | 15.0.0 | File upload drag-and-drop |

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
| @testing-library/react | 16.3.2 | React component testing utilities |
| @testing-library/jest-dom | 6.9.1 | Custom DOM matchers |
| @testing-library/user-event | 14.6.1 | User interaction simulation |
| cypress | 15.10.0 | E2E testing framework |
| msw | 2.11.5 | Mock Service Worker (API mocking in tests) |
| jest-axe / vitest-axe | latest | Accessibility testing assertions |

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

- **JointJS Plus** (`@joint/plus`) is a commercial library installed from the npm registry — requires a license for production use. Was previously pulled from a private Cloudsmith registry.
- **lodash-es** is used for proper tree-shaking; `lodash` (non-ES) is also declared as a resolution override.
- **Patternfly 6.x** is the Red Hat design system; major version upgrades often require component API changes.
- **React 19** is the latest major version; concurrent features are available.
- **yarn@4.1.0** (Berry) is the package manager — uses `node_modules` linker, not PnP.
- **`@loadable/component`** enables code-split lazy loading of heavy slices (e.g. Composer with JointJS+).
