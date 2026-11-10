# Inmanta web console

[Docs](./docs/index.md)

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
- `apps/web-console` (`@inmanta/web-console-app`): the ISO web console, with every feature. The composer needs JointJS+, which needs a licence token to install.

To install the OSS app only, which needs no token:

    yarn workspaces focus @inmanta/web-console-oss

That installs what the OSS app and its packages use, so `yarn build:oss` and `yarn start:oss` work. The checks that cover every package (`yarn lint`, `yarn tsc`, `yarn test`) and the ISO app need the full install, with the JointJS token exported in your shell (see [ENV Tokens and PAT](#env-tokens-and-pat)):

    yarn install

Every package declares whether it is OSS or ISO in its `package.json` (`"inmanta": { "edition": "oss" }`), and `yarn constraints` fails when an OSS package depends on an ISO one.

## Development setup/ Scripts

| Command                         | Description                                                                                                                                                                                                           |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prebuild`                      | runs `yarn clean`                                                                                                                                                                                                     |
| `build`                         | builds the ISO app (`apps/web-console`, through its `build` script) with Vite in production mode, into `dist/`                                                                                                        |
| `build:oss`                     | builds the OSS app (`apps/oss`) with Vite in production mode, into `apps/oss/dist/`                                                                                                                                   |
| `start`                         | starts the ISO app's development server with Vite over HTTP                                                                                                                                                           |
| `start:https`                   | starts the ISO app's development server with Vite over HTTPS (`HTTPS=true`)                                                                                                                                           |
| `start:oss`                     | starts the OSS app's development server with Vite over HTTP                                                                                                                                                           |
| `test`                          | runs the test suite with Vitest, one project per package (`yarn test --project feature-lsm` runs one)                                                                                                                 |
| `test:ci`                       | runs the test suite with Vitest in CI mode (`CI=true`, `--silent`)                                                                                                                                                    |
| `test:ui`                       | runs Vitest in UI mode                                                                                                                                                                                                |
| `format`                        | runs Prettier and formats the code                                                                                                                                                                                    |
| `format:check`                  | runs Prettier in check mode without writing changes                                                                                                                                                                   |
| `lint`                          | runs the Yarn constraints (`yarn.config.cjs`) and ESLint, failing on any warnings (`--max-warnings=0`)                                                                                                                |
| `lint:fix`                      | runs ESLint and attempts to automatically fix possible warnings/errors                                                                                                                                                |
| `tsc`                           | type-checks every package as its own TypeScript project (`tsc -b`) and checks the project references and the linked routes                                                                                            |
| `build:bundle-profile`          | builds the app with Vite in analyze mode (`vite build --mode analyze`)                                                                                                                                                |
| `bundle-profile:analyze`        | runs `yarn build:bundle-profile` to generate a bundle profile                                                                                                                                                         |
| `clean`                         | removes the builds (`dist`, `apps/oss/dist`) and the TypeScript build info (`.tsbuild`)                                                                                                                               |
| `delete:reports`                | deletes the Cypress reports in `cypress/reports`                                                                                                                                                                      |
| `precypress-test`               | runs `yarn run delete:reports` before Cypress tests                                                                                                                                                                   |
| `cypress-test:oss`              | runs the Cypress tests headless for OSS (requires `install:orchestrator:oss`)                                                                                                                                         |
| `cypress-test:iso`              | runs the Cypress tests headless for ISO (requires `install:orchestrator:iso`)                                                                                                                                         |
| `cypress-test:keycloak`         | runs the Cypress tests headless for OSS + Keycloak (requires `install:orchestrator:keycloak`)                                                                                                                         |
| `cypress-test:local-auth`       | runs the Cypress tests headless for OSS with local authentication (requires `install:orchestrator:local-auth`)                                                                                                        |
| `package-cleanup`               | runs `node clean_up_packages`                                                                                                                                                                                         |
| `check-circular-deps`           | runs `depcruise src packages apps`, which fails on any circular dependency in `src/`, `packages/` and `apps/`, and on an import of a workspace package that doesn't resolve                                           |
| `install:orchestrator:keycloak` | creates a Docker container with an OSS orchestrator configured with Keycloak                                                                                                                                          |
| `install:orchestrator`          | base command to install more specific versions of the orchestrator. The different arguments are: `version` `release` `branch`. For more details, see (local-setup repo)[https://code.inmanta.com/inmanta/local-setup] |
| `install:orchestrator:iso`      | creates a Docker container with the latest ISO orchestrator                                                                                                                                                           |
| `install:orchestrator:pxsdc`    | creates a Docker container with an orchestrator for the `pxsdc` project                                                                                                                                               |
| `install:orchestrator:oss`      | creates a Docker container with the latest dev OSS orchestrator                                                                                                                                                       |
| `install:orchestrator:ci`       | CI command to setup the orchestrator on Jenkins. Requires different arguments depending on the needed test suite. See `install:orchestrator`                                                                          |
| `kill-server`                   | removes the temp-folder and kills the containers                                                                                                                                                                      |
| `update:dist`                   | manual update of the `dist` folder in the container. Requires a container to run.                                                                                                                                     |

### ENV Tokens and PAT

You will need to create a file `env.sh` in `shell-scripts` folder containing the variable GITLAB_TOKEN. It should look like so:
`export GITLAB_TOKEN=xxxxxxxxxxxxxxxxx`
(xxxx equals your PAT token, of course.)

If you want to install the ISO version of the application, you will need to add a npm access token to the JointJS Plus library in your env file, and export it in the shell you install from. The OSS app installs without it.
`JOINTJS_NPM_TOKEN=jjs-xxxxxxxxxxxxxx`

## Authentication

To enable authentication with keycloak, you can use environment variables, e.g. add the following variable to a dotenv (`.env` in the root of the project) file (further information on <https://github.com/motdotla/dotenv>)

    VITE_SHOULD_USE_AUTH=true

The keycloak parameters need to be specified in an external file in the production environment, called config.js, following the example apps/web-console/src/config.js file.

The base url of the backend services can also be specified here, e.g.:

    VITE_API_BASEURL=http://localhost:8888

### Testing the Web-console with Cypress

Cypress can be configured via cypress.json (or command line arguments). It is always best to run the install commands from the web-console repository.

#### ISO

To setup the containers for the latest version of ISO, you can run these steps:

`yarn install:orchestrator:iso`

If you need to run the test-suit headless you can chain it with:

`cypress-test:iso`

or run `npx cypress open` if you need to run the tests in the cypress UI.

#### OSS

(If you want to run the cypress UI) Adjust the `cypress.json` file to have

```json
  env: {
    edition: "oss",
    project: "oss-frontend",
  },
```

Then :

`yarn install:orchestrator:oss`

If you need to run the test-suit headless you can chain it with:

`cypress-test:oss`

or run `npx cypress open` if you need to run the tests in the cypress UI.
