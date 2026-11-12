[Index](./index.md)

# Folder structure

The goal is to have the general guidelines about what should go where, but still leave some freedom for developers.
(for example adding subfolders for a group of components should still be allowed, if it helps understanding the structure)

The agreement is to roughly follow the building blocks in the folder structure, but to also put the related files together into slices.
If a domain type or query is used by multiple slices, it should either be moved to the common folders, or alternatively the slices can also be merged.
So a slice is not necessarily a single page (it might be a smaller or larger unit as well).
A slice also doesn't necessarily has to have all of the { Core, Data, UI} folders.

The code lives in packages (composition architecture, #7451). A package is imported by its package name, e.g. `@inmanta/web-console-core/Queries/Slices/Resource`.

```
packages/
  core/src/ - @inmanta/web-console-core, the web-console core layer (no components)
    Contracts/ - All interfaces that represent a contract, including FeatureModule
    Domain/ - Entities
    I18n/ - The words registry
    Language/ - Language extensions & isolated implementations
    Auth/ - The auth context and types
    Common/ - Shared data helpers (url state, attribute converters, ...)
    Queries/ - React Query hooks and their helpers
    Dependency/ - The dependency context and its default implementations
    Routing/ - Code related to routing and urls
    FormState/ - Helpers that turn service attributes into form fields
  ui/src/ - @inmanta/web-console-ui, components used by more than one feature (or a feature and the shell)
    Components/ - Including the modal and alert providers (ModalProvider, AppAlertProvider): the shell renders them, the test helpers re-export them for tests
    Presenters/, Styles/, Utils/
  shell/src/ - @inmanta/web-console-shell, the app frame: header, sidebar, breadcrumbs, global providers, auth, startup
    Components/ - The app frame (header, sidebar, breadcrumbs, banners, blocking modal, initializer)
    Auth/ - The auth providers
    Slices/ - The shell's own pages: login, not found, notifications, status
    monaco.ts - The Monaco setup every app imports at startup (@inmanta/web-console-shell/monaco)
  test-utils/src/ - @inmanta/web-console-test-utils, common test data, mock implementations, testing utilities, test setup
  features/ - One folder per feature, imported as @inmanta/web-console-feature-<name>
    composer/src/ - The Instance Composer, drawn with React Flow (@xyflow/react) and laid out with dagre (@dagrejs/dagre)
      index.ts - composerFeature, its FeatureModule
      Components/Composer/ - The canvas, its shapes, sidebars and providers
      Slices/ - The composer pages: creator, editor, viewer
    environment/src/ - The environment pages: dashboard, settings, create environment
      index.ts - environmentFeature, its FeatureModule
      Components/ - The components only the environment pages use: DictEditor, ImageUpload, InlineEditable
      Slices/ - The environment pages
    graphiql/src/ - The GraphiQL page, to explore the orchestrator GraphQL API
      index.ts - graphiqlFeature, its FeatureModule
      Slices/ - The GraphiQL page
    lsm/src/ - The Lifecycle Service Manager: catalog and service details, inventory and instance details, create/edit/duplicate, orders, events and diagnose
      index.ts - lsmFeature, its FeatureModule
      Components/ - The components only lsm uses, e.g. ServiceInstanceForm, TreeTable, EventsTable
      Slices/ - The lsm pages
    orchestration-engine/src/ - The Orchestration Engine: compile reports, desired state, compliance check, parameters
      index.ts - orchestrationEngineFeature, its FeatureModule
      Components/ - The components only the orchestration engine uses, e.g. DiffWizard, Timeline
      Slices/ - The orchestration engine pages
    resource-manager/src/ - The Resource Manager: resources and their details, discovered resources, agents, facts
      index.ts - resourceManagerFeature, its FeatureModule
      Components/ - The components only the resource manager uses: AddableSelectInput, CodeText, RequiresTable
      Slices/ - The resource manager pages
    user-management/src/ - The user management page: users, their passwords and roles
      index.ts - userManagementFeature, its FeatureModule
      Slices/ - The user management page
apps/
  oss/ - The OSS app, with the OSS features only: its Vite config (vite.config.ts) and index.html
    src/ - Its composition (app.ts: createApp with the features it ships), its entry (index.tsx), config.js and tests
  web-console/ - The ISO app, with every feature: its Vite config (vite.config.ts) and index.html
    src/ - Its composition (app.ts: createApp with the features it ships and the shell options), its entry (index.tsx), config.js and app-level tests
src/ - Only the global type declarations (typings.d.ts, vite-env.d.ts)
```

Every package and app is a Yarn workspace with its own `package.json`. Another package imports it through a `workspace:^` dependency, not a path alias. A new package needs:

- a `package.json` with its name (`@inmanta/web-console-...`), its edition (`"inmanta": { "edition": "oss" }`, or `"iso"` for a package only the ISO app may ship) and an `exports` block like the other packages: `"./*"` maps a deep import such as `@inmanta/web-console-core/Queries/Slices/Resource` to `src/Queries/Slices/Resource`, and `"."` maps the package name to `src/index.ts` (only for a package that has one; `ui` doesn't);
- a `workspace:^` dependency on it in every package that imports it, including the apps that ship it for a feature (`apps/web-console`, and `apps/oss` for an OSS feature), under `devDependencies` when only tests import it (like `test-utils`);
- its zone in `eslint.layers.js`;
- a `tsconfig.json` that extends `tsconfig.base.json` and references the projects of the packages it depends on, and an entry in the root `tsconfig.json`;
- a `yarn install` after adding or changing a `package.json`, so `yarn.lock` has its entry; CI installs with `--immutable` and fails without it.

Each package also lists the third-party packages it imports in its own `package.json`: `dependencies` for the code that ships, `devDependencies` for tests and test helpers. Two cases are easy to miss: a package also lists the required peer dependencies of what it uses (e.g. `oidc-client-ts` for `react-oidc-context`, `victory` for `@patternfly/react-charts`), and `test-utils` lists what its helpers import as `dependencies`, because other packages' tests run them. `yarn lint` checks this (`import/no-extraneous-dependencies`) and runs the Yarn constraints (`yarn.config.cjs`): every package uses the same version of a dependency, the GraphiQL packages are only allowed in the graphiql feature, and an OSS package never depends on an ISO one, directly or through other packages. The root `package.json` keeps the build, lint and test tools.

Each slice (a folder in a package's `Slices/`) uses the same layers: `Core/` for its types and contracts, `Data/` for transformations and implementations, `UI/` for its components.

## Builds and tests

Each app has its own Vite config, `apps/<app>/vite.config.ts`. It builds on `appConfig` from `vite.shared.ts` at the root (React, the global constants, the shared assets, Monaco, the dev server and the build settings) and adds the Vite plugins of the features it ships: a feature that needs Vite settings exports a plugin as `<package>/vite` (`vite.js`, plain JavaScript so Node loads it in any Vite config), like GraphiQL's. A feature loaded at runtime uses its plugin in its own build instead: the composer's plugin (its canvas chunk) is used by `packages/features/composer/vite.config.ts`, and the ISO app only adds it to its dev server and the tests, which load the composer from its source. The root scripts run the apps' scripts: `yarn build` and `yarn start` the ISO app's, which builds to `dist/` at the root, with the composer's separate build (`packages/features/composer/vite.config.ts`, loaded at runtime) next to it; `yarn build:oss` and `yarn start:oss` the OSS app's, which builds to `apps/oss/dist/`.

`vitest.config.ts` at the root has one Vitest project per package, named after it (`core`, `feature-lsm`, ...). `yarn test` runs them all, `yarn test --project feature-lsm` one of them.

## Type checking

`yarn tsc` builds the TypeScript project references (`tsc -b`): every package is its own project, and the declarations it generates go to `.tsbuild/`. `core` and `ui` have two projects, `tsconfig.src.json` for their code and `tsconfig.test.json` for their tests, because their tests use `test-utils`, which depends on them. A project's `references` must match the workspace dependencies in its `package.json`; TypeScript itself doesn't enforce that (an import of a package that isn't referenced compiles that package's source into the program), so `yarn tsc` checks it first (`scripts/check-project-references.js`).

The words and routes registries (`WordsRegistry`, `RouteRegistry`) are filled through declaration merging, and a project only sees the declarations of the files it loads:

- A package whose code uses the words of `ui` imports them in its `messages.ts`: `import type {} from "@inmanta/web-console-ui/messages";`.
- A package that names a route of another feature, for a link or as a parent page, declares that route in `src/linkedRoutes.ts` with the same params as the feature that owns it (in `src/testTypes.ts` when only the tests of `core` or `ui` name it). `yarn tsc` checks those declarations against the owners (`scripts/check-linked-routes.js`).

TypeScript 7's incremental build can keep a stale error after a declaration in another file changes. It happened once while setting this up: after routes were added to core's `testTypes.ts`, the core tests that use them kept reporting them as unknown until the build info was removed. If `yarn tsc` reports an error that doesn't match the code, run `yarn clean` (which removes `.tsbuild/`) and try again.
