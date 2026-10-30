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
    Components/
    Presenters/, Styles/, Utils/
  shell/src/ - @inmanta/web-console-shell, the app frame: header, sidebar, breadcrumbs, global providers, auth, startup
    Components/ - The app frame and global providers (header, sidebar, breadcrumbs, banners, alerts, modals, initializer)
    Auth/ - The auth providers
    Slices/ - The shell's own pages: login, not found, notifications, status
  test-utils/src/ - @inmanta/web-console-test-utils, common test data, mock implementations, testing utilities, test setup
  features/ - One folder per feature, imported as @inmanta/web-console-feature-<name>
    composer/src/ - The Instance Composer, the only code that imports JointJS (@joint/*)
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
  web-console/src/ - The app: its composition (app.ts: createApp with the features it ships and the shell options), its entry (index.tsx), Monaco setup, config.js and app-level tests
src/ - Only the global type declarations (typings.d.ts, vite-env.d.ts)
```

Each slice (a folder in a package's `Slices/`) uses the same layers: `Core/` for its types and contracts, `Data/` for transformations and implementations, `UI/` for its components.
