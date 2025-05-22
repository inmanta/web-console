# Inmanta web console

[Docs](./docs/index.md)

## Intro

This project is the current frontend for the Inmanta service orchestrator.  
The eventual goal is to replace the current dashboard entirely.  
The console is developed in TypeScript using React and React Query.  
Testing is performed using Cypress and Jest.

## UX Guideliness

The frontend uses (Patternfly)[https://www.patternfly.org/] for its UI components. The choice of the framework is motived by:

- Use by many (mostly RedHat backed) infra products (Cockpit, OpenStack, OpenShift, Keycloak, etc.). The advantage of this is that the scope of the component is similar and the design will have some familiarity.
- There are extensive UX guidelines included with the project both in general and per component.

## Development setup/ Scripts

| Command                         | Description                                                                                                                                                                                                           |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prebuild`                      | runs `yarn clean`                                                                                                                                                                                                     |
| `build`                         | builds the project with webpack in prod mode                                                                                                                                                                          |
| `start`                         | runs the project with webpack in dev mode and live reload                                                                                                                                                             |
| `start:https`                   | runs the project with webpack in dev mode and live reload, over https                                                                                                                                                 |
| `test`                          | tests the project with Jest                                                                                                                                                                                           |
| `test:ci`                       | test command for the CI pipeline                                                                                                                                                                                      |
| `format`                        | runs prettier and formats the code                                                                                                                                                                                    |
| `format:check`                  | runs prettier without formatting the code                                                                                                                                                                             |
| `lint`                          | runs the linter and generates a report in the command line                                                                                                                                                            |
| `lint:fix`                      | runs the linter and fixes possible warnings/errors                                                                                                                                                                    |
| `build:bundle-profile`          | runs `webpack --config webpack.prod.cjs --profile --json > stats.json`                                                                                                                                                |
| `bundle-profile:analyze`        | runs `yarn build:bundle-profile && webpack-bundle-analyzer ./stats.json`                                                                                                                                              |
| `clean`                         | runs `rimraf dist`                                                                                                                                                                                                    |
| `delete:reports`                | deletes the Cypress reports                                                                                                                                                                                           |
| `precypress-test`               | runs `yarn run delete:reports`                                                                                                                                                                                        |
| `cypress-test:oss`              | runs the Cypress tests headless for OSS (requires `install:orchestrator:oss`)                                                                                                                                         |
| `cypress-test:iso`              | runs the Cypress tests headless for ISO (requires `install:orchestrator:iso`)                                                                                                                                         |
| `cypress-test:keycloak`         | runs the Cypress tests headless for OSS+Keycloak (requires `install:orchestrator:keycloak`)                                                                                                                           |
| `package-cleanup`               | runs `node clean_up_packages`                                                                                                                                                                                         |
| `check-circular-deps`           | runs `madge --circular ./src/index.tsx`                                                                                                                                                                               |
| `install:orchestrator:keycloak` | creates a docker container with an OSS orchestrator with Keycloak                                                                                                                                                     |
| `install:orchestrator`          | Base command to install more specific versions of the orchestrator. The different arguments are: `version` `release` `branch`. For more details, see (local-setup repo)[https://code.inmanta.com/inmanta/local-setup] |
| `install:orchestrator:iso`      | creates a docker container with the latest ISO orchestrator                                                                                                                                                           |
| `install:orchestrator:oss`      | creates a docker container with the latest dev OSS orchestrator                                                                                                                                                       |
| `install:orchestrator:ci`       | CI command to setup the orchestrator on Jenkins. Requires different arguments depending on the needed test suite. See `install:orchestrator`                                                                          |
| `kill-server`                   | removes the temp-folder and kills the containers                                                                                                                                                                      |
| `update:dist`                   | manual update of the dist-folder in the container. Requires a container to run.                                                                                                                                       |

### PAT

You will need to create a file `env.sh` in `shell-scripts` folder containing the variable GITLAB_TOKEN. It should look like so:
`export GITLAB_TOKEN=xxxxxxxxxxxxxxxxx`
(xxxx equals your PAT token, of course.)

## Authentication

To enable authentication with keycloak, you can use environment variables, e.g. add the following variable to a dotenv (`.env` in the root of the project) file (further information on <https://github.com/motdotla/dotenv>)

    SHOULD_USE_AUTH=true

You can also specify the url of the keycloak server in the same file:

    KEYCLOAK_URL=<Your keycloak server url>

Alternatively, the keycloak parameters can also be specified in an external file in the production environment, called config.js, following the example src/config.js file.

The base url of the backend services can also be specified here, e.g.:

    API_BASEURL=http://localhost:8888

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
