# Developer Onboarding Guide

*Last Updated: 2026-03-18*

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥18.x (check `.nvmrc` or engine field) | JavaScript runtime |
| Yarn | 4.1.0 (Berry) | Package manager |
| Git | any | Version control |
| Inmanta Orchestrator | running on port 8888 | Backend API target |

> **Note**: Use `yarn` not `npm`. The repo uses Yarn 4 Berry with the `node-modules` linker.

## Quick Start

```bash
# 1. Install dependencies
yarn install

# 2. Start dev server (port 9000, proxies /api and /lsm to localhost:8888)
yarn start

# 3. Open browser
open http://localhost:9000
```

The app proxies API requests to `http://localhost:8888`. You need a running Inmanta Orchestrator backend for full functionality. Shell scripts in `shell-scripts/` can help set up the orchestrator (see `setup-orchestrator.sh`).

## Development Commands

| Command | Purpose |
|---------|---------|
| `yarn start` | Start dev server on port 9000 (HTTP) |
| `yarn start:https` | Start dev server on port 9000 (HTTPS, self-signed cert) |
| `yarn build` | Production build to `dist/` |
| `yarn test` | Run unit tests (Vitest) in watch mode |
| `yarn test:ci` | Run unit tests once (CI mode, 2-3 workers) |
| `yarn test:ui` | Run unit tests with Vitest UI |
| `yarn lint` | Run ESLint (zero warnings policy) |
| `yarn lint:fix` | Auto-fix ESLint issues |
| `yarn format` | Format code with Prettier |
| `yarn format:check` | Check formatting without writing |
| `yarn cypress-test:iso` | Run E2E tests (ISO edition) |
| `yarn cypress-test:oss` | Run E2E tests (OSS edition) |
| `yarn cypress-test:keycloak` | Run E2E tests (Keycloak auth) |
| `yarn cypress-test:local-auth` | Run E2E tests (local auth) |
| `yarn check-circular-deps` | Detect circular dependencies (Madge) |
| `yarn build:bundle-profile` | Generate bundle analysis |

## Common Tasks

### Adding a New Feature Slice

1. Create `src/Slices/YourFeature/` directory.
2. Add a `route.ts` (or similar) defining the route and registering with `RouteManager`.
3. Create `Index.tsx` as the slice entry point.
4. Add React Query hooks in a local `Data/` subdirectory.
5. Register the slice route in the route manager.
6. Add unit tests alongside components (`*.test.tsx`).

### Adding a Reusable Component

1. Create `src/UI/Components/YourComponent/` directory.
2. Export the component from `index.ts`.
3. Write tests in `YourComponent.test.tsx`.

### Running Unit Tests for a Specific File

```bash
yarn vitest run src/Slices/ServiceCatalog
```

### Running a Single Cypress Scenario

```bash
yarn cypress open --config-file cypress.config.iso.cjs
# Then select the scenario in the Cypress UI
```

### Authentication Configuration

Edit `src/config.js` or set environment variables:

```js
// No auth (default for local dev without orchestrator auth)
window.inmantaConfig = { VITE_SHOULD_USE_AUTH: "" };

// Keycloak
window.inmantaConfig = {
  VITE_SHOULD_USE_AUTH: "keycloak",
  VITE_API_BASEURL: "http://localhost:8888",
  // + keycloak realm/url/clientId fields
};

// Local auth
window.inmantaConfig = { VITE_SHOULD_USE_AUTH: "local-auth" };
```

## Debugging Tips

- **API not loading**: Ensure the Inmanta Orchestrator is running on `localhost:8888`. Check the Vite dev server proxy logs.
- **Auth issues**: Check `src/config.js` — `VITE_SHOULD_USE_AUTH` controls the auth mode.
- **Type errors after pulling**: Run `yarn install` to ensure dependencies are up to date.
- **Monaco editor not loading**: Monaco uses web workers; if you see worker errors, check `src/monaco-workers.ts`.
- **Circular dependency warnings**: Run `yarn check-circular-deps` to identify problematic imports.
- **ESLint blocking CI**: ESLint uses `max-warnings=0`; any warning is a failure. Run `yarn lint:fix` or fix manually.
