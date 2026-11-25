[Main Index](./index.md)

# Development guide

How the code is organised and how to extend it: a new feature, a new app or a new language. The details live elsewhere: [Folder structure](./design/folder-structure.md) for the packages and their setup, [Composing an app](./notes.md#composing-an-app) for `createApp`, and [Features and routes in tests](./notes.md#features-and-routes-in-tests).

## Package layout

The code lives in Yarn workspaces, imported by their package name (`@inmanta/web-console-...`):

| Folder                | Package                                                | What                                                                                       |
| --------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `packages/core`       | `@inmanta/web-console-core`                            | the web-console core layer: domain types, queries, contracts, routing, i18n; no components |
| `packages/ui`         | `@inmanta/web-console-ui`                              | components used by more than one feature, or by a feature and the shell                    |
| `packages/shell`      | `@inmanta/web-console-shell`                           | the app frame (header, sidebar, auth, startup) and `createApp`                             |
| `packages/features/*` | `@inmanta/web-console-feature-<name>`                  | one package per feature, e.g. lsm, the composer, the resource manager                      |
| `packages/test-utils` | `@inmanta/web-console-test-utils`                      | test data, mocks and helpers, for tests only                                               |
| `apps/*`              | `@inmanta/web-console-oss`, `@inmanta/web-console-app` | an app: the shell plus the features it ships                                               |

Each package declares its edition in its `package.json` (`"inmanta": { "edition": "oss" }` or `"iso"`). The OSS app (`apps/oss`) ships the OSS features only; the ISO app (`apps/web-console`) ships every feature.

## Import rules

Each layer only imports the layers below it:

| Layer      | May import                       |
| ---------- | -------------------------------- |
| core       | vendor libraries only            |
| ui         | core                             |
| shell      | core, ui                         |
| a feature  | core, ui, its own code           |
| an app     | everything: it composes the rest |
| test-utils | core, ui                         |

- **No feature imports another feature**, not even one it needs (the composer needs lsm). Code two features share moves down: logic to the web-console core layer, components to ui. To link to another feature's page, declare its route in `src/linkedRoutes.ts` (see [Type checking](./design/folder-structure.md#type-checking)). To add something to another feature's page, contribute to its extension point (see [Extension points](#extension-points)).
- **Tests** follow the rules of the code they test, and may also import `@inmanta/web-console-test-utils`. Only tests and test helpers import it.
- **Import from the module that declares the name**, e.g. `@inmanta/web-console-core/Queries/Slices/Resource`, not from a broad entry point. The root of the web-console core layer, `@inmanta/web-console-core`, is a narrow one: it only re-exports the contracts, domain types, i18n and language helpers, so `FeatureModule`, `Route` and `words` come from there. An `index.ts` only re-exports its own folder and nothing heavy; a file inside a slice doesn't import its own slice's `index.ts`. Use `import type` for an import that is only a type.
- **Only the GraphiQL feature** imports the GraphiQL packages, and tests create their msw server with `setupTestServer` from the test utils.

`yarn lint` enforces the layers (`import/no-restricted-paths`, zones in `eslint.layers.js`), the restricted imports and the dependencies each package declares. `yarn constraints`, part of `yarn lint`, fails when an OSS package depends on an ISO one. `yarn check-circular-deps` fails on an import cycle.

## Adding a feature

1. **Create the package** in `packages/features/<name>`, set up like the others (see the checklist in [Folder structure](./design/folder-structure.md)): `package.json` with its edition and `exports`, `tsconfig.json`, an entry in the root `tsconfig.json`, its zone in `eslint.layers.js`, and `yarn install`. `packages/features/graphiql` is a small one to copy.
2. **Export its `FeatureModule`** from its `src/index.ts`:

   ```ts
   import { FeatureModule } from "@inmanta/web-console-core";
   import * as MyPage from "@inmanta/web-console-feature-my-feature/Slices/MyPage/Core/Route";
   import { myFeatureMessages } from "./messages";

   export const myFeature: FeatureModule = {
     id: "my-feature",
     version: APP_VERSION,
     messages: myFeatureMessages,
     routes: [
       {
         route: MyPage.route,
         page: () =>
           import("@inmanta/web-console-feature-my-feature/Slices/MyPage/UI").then(
             (module) => module.MyPage
           ),
       },
     ],
     navigation: [{ kind: "MyPage", group: "orchestrationEngine" }],
   };
   ```

   The app builds its routes, pages and sidebar from this object only. Pages are loaded lazily; set `preload: false` for heavy pages few users open. `licensedFeature` hides the sidebar entries when the license doesn't include it.

3. **Declare its routes.** Each route adds its kind and params to `RouteRegistry` through declaration merging, next to the route (see `packages/features/graphiql/src/Slices/GraphiQL/Core/Route.ts`):

   ```ts
   declare module "@inmanta/web-console-core/Domain/Route" {
     interface RouteRegistry {
       MyPage: undefined; // or the params, e.g. { id: string }
     }
   }
   ```

4. **Add its messages** in `src/messages.ts` (see [Messages](#messages)).
5. **Add it to the apps that ship it**: `features` in `apps/<app>/src/app.ts`, a `workspace:^` dependency in `apps/<app>/package.json`, a reference in `apps/<app>/tsconfig.json`, and its id in `apps/<app>/src/app.test.ts`. An OSS feature goes in both apps; also add it to the message globs in `apps/oss/src/test-setup.ts`.
   - A feature with a Vite plugin (`<package>/vite`, like GraphiQL's) also adds it to `apps/<app>/vite.config.ts`, to `vitest.config.ts` (and `vitest.config.oss.ts` when it is OSS), and to the root `package.json`'s `devDependencies`, since those configs import it.
   - When the test helpers stub one of its routes (`stubbedRoutes` in test-utils), add the route's declaration to `apps/web-console/src/featureRoutes.ts`, which `appStubRoutes.test.ts` checks them against.
6. **Test it with its own feature only**: `MockedDependencyProvider` takes `features={[myFeature]}`; a link to another feature's page needs a stub route (see [Features and routes in tests](./notes.md#features-and-routes-in-tests)).

To load a feature at runtime from a separate build instead of bundling it, like the composer, see [Features loaded at runtime](./notes.md#features-loaded-at-runtime).

### Extension points

A feature adds to another feature's page or to the shell's header through `contributions`, without importing it. Today the extension points are links (`LinkAction`): in lsm's inventory and instance menus, and in the header's user and Developer Tools menus.

```ts
// in the FeatureModule; CodeIcon from @patternfly/react-icons, words from @inmanta/web-console-core
contributions: {
  "header.developerTools.actions": [
    {
      id: "my-feature",
      getLabel: () => words("myFeature.title"),
      icon: CodeIcon,
      getUrl: (routeManager) => routeManager.getUrl("MyPage", undefined),
    },
  ],
},
```

To add an extension point, declare it in `ExtensionPointRegistry` through declaration merging, with the type of what is contributed to it. Declare it in `packages/core/src/Contracts/ExtensionPoints.ts` when other features contribute to it, so they don't have to import its owner; a point only its owner's own code uses can be declared in that feature. The feature or the shell that owns the point renders what is contributed with `useContributions(point)` from `@inmanta/web-console-core/Dependency`, or `useVisibleLinkActions(point)` for links, which leaves out those whose `isVisible` returns false.

### Messages

Every text a user sees is a message, looked up with `words("myFeature.title")`. A package declares its English messages in `src/messages.ts` and adds their keys to `WordsRegistry`, so `words` only accepts keys that exist:

```ts
export const myFeatureMessages = {
  "myFeature.title": "My feature",
  "myFeature.count": (count: number) => `${count} items`,
};

type MyFeatureMessages = typeof myFeatureMessages;

declare module "@inmanta/web-console-core/I18n/Words" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface WordsRegistry extends MyFeatureMessages {}
}
```

Prefix the keys with the feature's name. A package that also uses the words of ui adds `import type {} from "@inmanta/web-console-ui/messages";`. The shell registers the messages of the web-console core layer, ui and every feature of the app when it starts, so don't call `words` while a module loads.

## Adding an app

An app is a folder in `apps/` that calls `createApp` with the features it ships. Copy `apps/oss`:

- `package.json` with its name, its edition and its features as dependencies; `tsconfig.json` with their references, and an entry in the root `tsconfig.json`.
- `index.html`, and `src/index.tsx`, which imports `@inmanta/web-console-shell/monaco` and calls `app.render`.
- `src/app.ts`: `createApp({ features: [...], shell: {...} })` (see [Composing an app](./notes.md#composing-an-app)).
- `src/config.js`, the runtime config (e.g. `window.auth`), which the build copies next to the app and loads first.
- `src/app.test.ts`, which pins the app's feature ids and checks its routes and sidebar.
- `src/test-setup.ts`, which registers the messages of its features, and a Vitest config that uses it: `vitest.config.ts` uses the ISO app's setup for every package, so copy `vitest.config.oss.ts` and point the app's `test` script at it (like `yarn test:oss`).
- `vite.config.ts`: `appConfig(import.meta.dirname, <output folder>)` from `vite.shared.ts`, plus the Vite plugins of its features.

Then wire it into the repository:

- `eslint.layers.js`: add it to `app`.
- Root `package.json`: `build:<app>` and `start:<app>` scripts, the app in `build:ci`, its output folder in `files` (the npm package) and in `clean`.
- `.gitignore`, `.prettierignore` and the `ignores` of `eslint.config.js`: its output folder.
- `scripts/check-no-cdn.js`, `scripts/check-dist-versions.js` and `scripts/build-sbom.js`: its output folder.
- To test it on an orchestrator: an `update:dist:<app>` script, and its output folder in `shell-scripts/setup-orchestrator.sh` (`WEB_CONSOLE_BUILD`) for the edition that ships it. The Jenkinsfiles pick the build per job, e.g. `jenkins/Jenkinsfile.nightly-oss-e2e`.

## Adding a language

English is the default language and the fallback for every key another language lacks, so a partial translation never shows a raw key. A language is a `LocaleModule` with the same keys as English. It lives in the app that ships it, e.g. `apps/<app>/src/locales/nl.ts`: the app is the only package that knows all its features.

```ts
import type { LocaleModule } from "@inmanta/web-console-core/I18n/Words";

export const dutch: LocaleModule = {
  locale: "nl",
  label: "Nederlands",
  messages: { "login.title": "Meld je aan bij je account" },
};
```

The app registers it and picks its language in `src/index.tsx`, before `app.render`: `registerLocale(dutch)`, then `setLocale("nl")`. Components don't re-render when the language changes, so switching it means reloading the app. There is no language picker yet: the app picks one language when it starts.

## Installing

`yarn install` installs every package, with no token. After adding a package or changing a `package.json`, run `yarn install` and commit `yarn.lock` with it: CI installs with `--immutable` and fails when `yarn.lock` doesn't match the `package.json` files.

## Before opening a PR

Run the quick checks: `yarn format`, `yarn lint`, `yarn tsc`, `yarn check-circular-deps` and `yarn test`. The main CI job also builds (`yarn build:ci`) and checks the build (`yarn check-no-cdn`, `yarn check-dist-versions`). Add one change entry per PR in `changelogs/unreleased/<issue>-<topic>.yml`:

```yaml
description: What changed, in one or two sentences.
issue-nr: 1234
change-type: patch
destination-branches: [master, iso9]
sections: {}
```
