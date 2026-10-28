[Index](./index.md)

# Folder structure

The goal is to have the general guidelines about what should go where, but still leave some freedom for developers.
(for example adding subfolders for a group of components should still be allowed, if it helps understanding the structure)

The agreement is to roughly follow the building blocks in the folder structure, but to also put the related files together into slices.
If a domain type or query is used by multiple slices, it should either be moved to the common folders, or alternatively the slices can also be merged.
So a slice is not necessarily a single page (it might be a smaller or larger unit as well).
A slice also doesn't necessarily has to have all of the { Core, Data, UI} folders.

The code is moving into packages, one layer at a time (composition architecture, #7451). A package is imported by its package name, e.g. `@inmanta/web-console-core/Queries/Slices/Resource`.

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
  features/ - One folder per feature that has moved, imported as @inmanta/web-console-feature-<name>
    composer/src/ - The Instance Composer, the only code that imports JointJS (@joint/*)
      index.ts - composerFeature, its FeatureModule
      Components/Composer/ - The canvas, its shapes, sidebars and providers
      Slices/ - The composer pages: creator, editor, viewer
    orchestration-engine/src/ - The Orchestration Engine: compile reports, desired state, compliance check, parameters
      index.ts - orchestrationEngineFeature, its FeatureModule
      Components/ - The components only the orchestration engine uses, e.g. DiffWizard, Timeline
      Slices/ - The orchestration engine pages
apps/
  web-console/src/ - The app: its composition (app.ts: createApp with the features it ships and the shell options), its entry (index.tsx), Monaco setup, config.js and app-level tests
src/
  Features/ - The FeatureModule of each feature that hasn't moved to packages/features yet
  UI/
    Components/ - Components that only one feature uses, waiting to move there
  Slices/ (repeat the 3 layers for each slice)
    <SliceName>
        Core (slice specific)
            any types or contracts
        Data (slice specific)
            transformations
            implementations
        UI (slice specific)
            Components
```
