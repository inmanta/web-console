# Inmanta web console

[Docs](./docs/index.md) · [Development guide](./docs/development-guide.md)

## Intro

This project is the current frontend for the Inmanta service orchestrator.  
The eventual goal is to replace the current dashboard entirely.  
The console is developed in TypeScript using React and React Query.  
Testing is performed using Cypress and Vitest.

## UX Guideliness

The frontend uses (Patternfly)[https://www.patternfly.org/] for its UI components. The choice of the framework is motived by:

- Use by many (mostly RedHat backed) infra products (Cockpit, OpenStack, OpenShift, Keycloak, etc.). The advantage of this is that the scope of the component is similar and the design will have some familiarity.
- There are extensive UX guidelines included with the project both in general and per component.

## Installing

The repository holds two apps:

- `apps/oss` (`@inmanta/web-console-oss`): the open-source web console, with the OSS features only.
- `apps/web-console` (`@inmanta/web-console-app`): the ISO web console, with every feature.

To install both, with every package:

    yarn install

No token is needed to install. After adding a package or changing a `package.json`, run `yarn install` again and commit `yarn.lock` with it: CI installs with `--immutable`.

Every package declares whether it is OSS or ISO in its `package.json` (`"inmanta": { "edition": "oss" }`), and `yarn constraints` fails when an OSS package depends on an ISO one. The [development guide](./docs/development-guide.md) describes the packages, the import rules and how to add a feature, an app or a language.

## Development setup/ Scripts

| Command                           | Description                                                                                                                                                                                                           |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prebuild`                        | runs `yarn clean`                                                                                                                                                                                                     |
| `build`                           | builds the ISO app (`apps/web-console`, through its `build` script) with Vite in production mode, into `dist/`, with the composer's separate build next to it                                                         |
| `build:oss`                       | builds the OSS app (`apps/oss`) with Vite in production mode, into `dist-oss/`                                                                                                                                        |
| `build:ci`                        | the CI build: the ISO app and the composer (`build`), the OSS app and the SBOM, all with the version in `package.json`                                                                                                |
| `build:sbom`                      | writes the SBOM of each app into its build (`dist/sbom.cdx.json`, `dist-oss/sbom.cdx.json`); part of `build:ci`                                                                                                       |
| `start`                           | starts the ISO app's development server with Vite over HTTP                                                                                                                                                           |
| `start:https`                     | starts the ISO app's development server with Vite over HTTPS (`HTTPS=true`)                                                                                                                                           |
| `start:oss`                       | starts the OSS app's development server with Vite over HTTP                                                                                                                                                           |
| `test`                            | runs the test suite with Vitest, one project per package (`yarn test --project feature-lsm` runs one)                                                                                                                 |
| `test:ci`                         | runs the test suite with Vitest in CI mode (`CI=true`, `--silent`)                                                                                                                                                    |
| `test:ui`                         | runs Vitest in UI mode                                                                                                                                                                                                |
| `test:oss`                        | runs the tests of the OSS packages only, with the OSS app's setup (`vitest.config.oss.ts`)                                                                                                                            |
| `format`                          | runs Prettier and formats the code                                                                                                                                                                                    |
| `format:check`                    | runs Prettier in check mode without writing changes                                                                                                                                                                   |
| `lint`                            | runs the Yarn constraints (`yarn.config.cjs`) and ESLint, failing on any warnings (`--max-warnings=0`)                                                                                                                |
| `lint:fix`                        | runs ESLint and attempts to automatically fix possible warnings/errors                                                                                                                                                |
| `tsc`                             | type-checks every package as its own TypeScript project (`tsc -b`) and checks the project references and the linked routes                                                                                            |
| `tsc:oss`                         | type-checks the OSS app and its packages only (`tsc -b` in `apps/oss`)                                                                                                                                                |
| `build:bundle-profile`            | builds the app with Vite in analyze mode (`vite build --mode analyze`)                                                                                                                                                |
| `bundle-profile:analyze`          | runs `yarn build:bundle-profile` to generate a bundle profile                                                                                                                                                         |
| `clean`                           | removes the builds (`dist`, `dist-oss`, `packages/features/composer/dist`) and the TypeScript build info (`.tsbuild`)                                                                                                 |
| `delete:reports`                  | deletes the Cypress reports in `cypress/reports`                                                                                                                                                                      |
| `precypress-test`                 | runs `yarn run delete:reports` before Cypress tests                                                                                                                                                                   |
| `cypress-test:oss`                | runs the Cypress tests headless for OSS (requires `install:orchestrator:oss`)                                                                                                                                         |
| `cypress-test:iso`                | runs the Cypress tests headless for ISO (requires `install:orchestrator:iso`)                                                                                                                                         |
| `cypress-test:keycloak`           | runs the Cypress tests headless for OSS + Keycloak (requires `install:orchestrator:keycloak`)                                                                                                                         |
| `cypress-test:oidc`               | runs the Cypress tests headless for OSS + OIDC (requires `install:orchestrator:oidc`)                                                                                                                                 |
| `cypress-test:ship-modes`         | runs the Cypress tests of the composer's ship modes headless for ISO (requires `install:orchestrator:iso`, see `cypress.config.ship-modes.cjs`)                                                                       |
| `composer-ship-mode`              | puts a build in one of the composer's ship modes: `yarn composer-ship-mode <without\|combined\|mismatch> [--dir <folder>] [--container <name>]`                                                                       |
| `cypress-test:local-auth`         | runs the Cypress tests headless for OSS with local authentication (requires `install:orchestrator:local-auth`)                                                                                                        |
| `package-cleanup`                 | runs `node clean_up_packages`                                                                                                                                                                                         |
| `check-circular-deps`             | runs `depcruise src packages apps`, which fails on any circular dependency in `src/`, `packages/` and `apps/`, and on an import of a workspace package that doesn't resolve                                           |
| `check-no-cdn`                    | fails when a build has a CDN URL in it; checks every build of `build:ci`, or the folders given, e.g. `yarn check-no-cdn dist-oss`                                                                                     |
| `check-dist-versions`             | fails when a build of `build:ci` (ISO app, OSS app, composer) has another version than `package.json`                                                                                                                 |
| `install:orchestrator:keycloak`   | creates a Docker container with an OSS orchestrator configured with Keycloak                                                                                                                                          |
| `install:orchestrator:oidc`       | creates a Docker container with an OSS orchestrator configured with OIDC                                                                                                                                              |
| `install:orchestrator:local-auth` | creates a Docker container with an OSS orchestrator configured with local authentication                                                                                                                              |
| `install:orchestrator`            | base command to install more specific versions of the orchestrator. The different arguments are: `version` `release` `branch`. For more details, see (local-setup repo)[https://code.inmanta.com/inmanta/local-setup] |
| `install:orchestrator:iso`        | creates a Docker container with the latest ISO orchestrator                                                                                                                                                           |
| `install:orchestrator:pxsdc`      | creates a Docker container with an orchestrator for the `pxsdc` project                                                                                                                                               |
| `install:orchestrator:oss`        | creates a Docker container with the latest dev OSS orchestrator                                                                                                                                                       |
| `install:orchestrator:ci`         | CI command to setup the orchestrator on Jenkins. Requires different arguments depending on the needed test suite. See `install:orchestrator`                                                                          |
| `kill-server`                     | removes the orchestrator's containers, network and volumes (Compose project `local-setup`) and the temp-folder                                                                                                        |
| `update:dist`                     | manual update of the `dist` folder in the container. Requires a container to run.                                                                                                                                     |
| `update:dist:oss`                 | same as `update:dist` with the OSS app (`dist-oss`), for an OSS orchestrator. Requires a container to run.                                                                                                            |
| `codegen`                         | generates the types of the GraphQL queries from the schema (see "GraphQL queries" in `docs/notes.md`)                                                                                                                 |
| `codegen:watch`                   | runs `codegen` again on every change                                                                                                                                                                                  |
| `codegen:schema`                  | pulls the GraphQL schema from a running orchestrator (default `http://localhost:8888`)                                                                                                                                |
| `codegen:check`                   | pulls the schema, then fails when the generated types are stale                                                                                                                                                       |

### ENV Tokens and PAT

You will need to create a file `env.sh` in `shell-scripts` folder containing the variable GITLAB_TOKEN. It should look like so:
`export GITLAB_TOKEN=xxxxxxxxxxxxxxxxx`
(xxxx equals your PAT token, of course.)

## Authentication

To enable authentication with keycloak, you can use environment variables, e.g. add the following variable to a dotenv (`.env` in the root of the project) file (further information on <https://github.com/motdotla/dotenv>)

    VITE_SHOULD_USE_AUTH=true

The keycloak parameters need to be specified in an external file in the production environment, called config.js, following the example apps/web-console/src/config.js file.

The base url of the backend services can also be specified here, e.g.:

    VITE_API_BASEURL=http://localhost:8888

### Testing the Web-console with Cypress

Cypress is configured per suite in the `cypress.config*.cjs` files (or command line arguments). It is always best to run the install commands from the web-console repository.

#### ISO

Build the ISO app and set up the containers for the latest version of ISO with it (`dist/`):

`yarn build && yarn install:orchestrator:iso`

If you need to run the test-suit headless you can chain it with:

`yarn cypress-test:iso`

or run `npx cypress open` if you need to run the tests in the cypress UI.

#### OSS

Build the OSS app and set up the orchestrator with it (`dist-oss/`):

`yarn build:oss && yarn install:orchestrator:oss`

If you need to run the test-suit headless you can chain it with:

`yarn cypress-test:oss`

or run `npx cypress open --config-file cypress.config.oss.cjs` if you need to run the tests in the cypress UI.
