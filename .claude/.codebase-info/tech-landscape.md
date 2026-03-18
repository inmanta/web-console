# Technology Landscape

*Last Updated: 2026-03-18*

## Source of Truth Files

| Information | Source File |
|-------------|-------------|
| Package versions & scripts | `package.json` |
| TypeScript config | `tsconfig.json` |
| Build config | `vite.config.ts` |
| E2E test config | `cypress.config.cjs` (+ variant configs) |
| Lint rules | `eslint.config.js` |
| Code formatting | `.prettierrc.cjs` |
| Runtime config | `src/config.js` (deployed with app) |
| CI/CD pipeline | `Jenkinsfile` |

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Language | TypeScript 5.9 (strict) | Type-safe JavaScript |
| UI Framework | React 19 | Component-based UI |
| Routing | React Router 7 | Client-side SPA routing |
| Server State | TanStack React Query 5 | API caching, polling, mutation |
| UI Components | PatternFly 6 | Red Hat enterprise design system |
| Styling | styled-components 6 | Component-scoped CSS-in-JS |
| Diagrams | JointJS+ 4 | Interactive graph/diagram editor (Composer feature) |
| Diagrams | Mermaid 11 | Text-to-diagram rendering |
| Code Editor | Monaco Editor 0.52 | VSCode-based in-browser editor |
| Authentication | Keycloak JS 26 | OIDC/OAuth2 with Keycloak server |
| GraphQL | graphql-request 7 | Lightweight GraphQL client |
| Date/Time | Moment.js + moment-timezone | Date parsing, formatting, timezones |
| Utilities | lodash-es | Tree-shakeable utility functions |
| Build Tool | Vite 7 | Fast dev server and bundler |
| Test Runner | Vitest 4 | Unit/integration tests |
| E2E Tests | Cypress 15 | Browser-based E2E tests |
| Linting | ESLint 9 | Code quality enforcement |
| Formatting | Prettier 3 | Consistent code style |
| Package Manager | Yarn 4.1 (Berry) | Dependency management |

## Key Dependencies

- **PatternFly**: Red Hat's design system — provides all base UI components (tables, modals, forms, navigation). Version upgrades can be breaking.
- **JointJS+**: Commercial diagramming library used in the Composer slice for visual service instance composition. Requires license.
- **Monaco Editor**: The same editor engine as VSCode, used for YAML/JSON/Python editing within the app.
- **React Query**: The primary state management solution — no Redux or Zustand. All server state goes through React Query.
- **Keycloak JS**: Enterprise SSO integration. The app supports three auth modes controlled by `config.js`.
- **Mermaid**: Renders text-based diagrams (flowcharts, sequence diagrams) in the MarkdownPreview slice.

## Infrastructure

| Concern | Tool / Platform |
|---------|----------------|
| CI/CD | Jenkins (Jenkinsfile) |
| E2E test backends | Docker containers (shell-scripts/) |
| Dev proxy | Vite built-in proxy (→ localhost:8888) |
| Package registry | GitHub npm registry (`@inmanta` scope) |
| Browser targets | Last 2 versions: Chrome, Firefox, Edge, Safari |

## Build Output

Vite produces a `dist/` directory with:
- `index.html` — SPA shell
- `*.js` / `*.css` — code-split vendor chunks (react, patternfly, monaco, jointjs, graphql, routing, state, utils)
- `config.js` — copied as-is (runtime config, not bundled)
- `version.json` — generated with git commit hash + build date
- `images/`, `favicon.ico` — static assets (moved to root by custom plugin)

Vendor chunk splitting in `vite.config.ts` controls bundle caching strategy.
