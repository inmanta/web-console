# Entry Points

*Last Updated: 2026-03-18*

## Application Entry Points

| Entry Point | Type | Purpose | File |
|-------------|------|---------|------|
| `index.html` | HTML shell | SPA root, loads config.js then index.tsx | `index.html` |
| `src/config.js` | Runtime config | Deployment-time configuration (auth mode, API URL) | `src/config.js` |
| `src/index.tsx` | React root | Bootstraps React app, mounts to `#root` | `src/index.tsx` |
| `src/Injector.tsx` | DI root | Wires all concrete implementations | `src/Injector.tsx` |
| `src/UI/Root/` | Layout root | Main layout with navigation, renders route pages | `src/UI/Root/` |

## Bootstrap Sequence

```
index.html
  └─ loads src/config.js (runtime config, not bundled)
  └─ loads src/index.tsx (bundled app)
       └─ monaco-workers.ts  (registers Monaco language workers)
       └─ React.render(
            ErrorBoundary
            └─ QueryControlProvider     (server-state lifecycle control)
               └─ QueryClientProvider  (React Query, retry:false, gcTime:5000)
                  └─ CustomRouter      (React Router v7, hash or history mode)
                     └─ AuthProvider   (selected by config: keycloak/local/none)
                        └─ Injector    (creates + injects all dependencies)
                           └─ DependencyProvider
                              └─ ModalProvider
                                 └─ UpdateBanner
                                    └─ Root  (layout + routes)
          )
```

## Injector.tsx — Dependency Wiring

`src/Injector.tsx` creates concrete instances and provides them via context:

| Dependency | Interface | Concrete Implementation |
|------------|-----------|------------------------|
| `urlManager` | `BaseUrlManager` | `PrimaryBaseUrlManager` |
| `orchestratorProvider` | `OrchestratorProvider` | Backend-connected provider |
| `routeManager` | `RouteManager` | `PrimaryRouteManager` |
| `environmentHandler` | `EnvironmentHandler` | Context-aware handler |
| `archiveHelper` | `ArchiveHelper` | Concrete archive utility |
| `authHelper` | (internal) | Auth-mode-specific helper |

## Route Entry Points

Routes are defined in feature slices and registered with `PrimaryRouteManager`. The `src/UI/Root/` component reads the route registry and renders page components using React Router.

| Route Pattern | Slice / Component |
|--------------|-------------------|
| `/` | Dashboard or Home |
| `/login` | Slices/Login/ |
| `/:env/catalog` | Slices/ServiceCatalog/ |
| `/:env/inventory/:service` | Slices/ServiceInventory/ |
| `/:env/desired-state` | Slices/DesiredState/ |
| `/:env/resources` | Slices/ResourceDetails/ |
| `/:env/compile-reports` | Slices/CompileReports/ |
| `/:env/orders` | Slices/Orders/ |
| `/:env/settings` | Slices/Settings/ |
| `/:env/status` | Slices/Status/ |
| `/:env/composer` | Slices/Composer/ |

## CLI / NPM Commands

| Command | Purpose |
|---------|---------|
| `yarn start` | Start Vite dev server on port 9000 (HTTP) |
| `yarn start:https` | Start Vite dev server on port 9000 (HTTPS) |
| `yarn build` | Production build to `dist/` |
| `yarn test` | Run unit tests with Vitest |
| `yarn cypress-test:iso` | Run E2E tests (ISO edition) |
| `yarn lint` | Run ESLint |
| `yarn format` | Run Prettier |
