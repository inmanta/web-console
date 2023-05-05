# Inmanta web console

[Docs](./docs/index.md)

## Intro

This project is the current frontend of for the inmanta service orchestrator.  
The eventual goal is to replace the current dashboard entirely.  
The console is developed in typescript using react and redux (through [easy peasy](https://easy-peasy.now.sh/)).  
Testing is performed using cypress.

## UX Guideliness

The frontend uses the (patternfly v4 framework)[https://www.patternfly.org/v4/] for its UI components. The choice of the framework is motived by:

- Use by many (mostly RedHat backed) infra products (Cockpit, Openstack, Openshift, Keycloack, ...) The advantage of this is that the scope of the component is similar and the design will have some familiarity.
- There are extensive UX guideliness included with the project both in general and per component.

## Development setup

    yarn # install dependencies

    yarn build # build the project

    yarn start # start the development server

    yarn test # run the test suite

    yarn lint # Run the linter

    yarn format # Run the code formatter

    yarn bundle-profile:analyze # Launch a tool to inspect the bundle size

    yarn setup-server:lsm # Will setup and install an orchestrator running on port 8888 with lsm modules.

    yarn cypress-test # Run tests with Cypress (Requires the previous command to run succesfully)

    yarn kill-server:lsm # This will remove the temporary folder containing the local-setup repo and destroy the docker containers that were setup previously with the setup-server:lsm command.

### PAT
You will need to create a file `env.sh` in `shell-scripts` folder containing the variable GITLAB_TOKEN. It should look like so: 
``export GITLAB_TOKEN=xxxxxxxxxxxxxxxxx``
(xxxx equals your PAT token, of course.)

## Authentication
To enable authentication with keycloak, you can use environment variables, e.g. add the following variable to a dotenv (`.env` in the root of the project) file (further information on <https://github.com/motdotla/dotenv>)

    SHOULD_USE_AUTH=true

You can also specify the url of the keycloak server in the same file:

    KEYCLOAK_URL=<Your keycloak server url>

Alternatively, the keycloak parameters can also be specified in an external file in the production environment, called config.js, following the example src/config.js file.

The base url of the backend services can also be specified here, e.g.:

    API_BASEURL=http://localhost:8888

Cypress can be configured via cypress.json (or command line arguments), e.g. to record videos of each test run:

    "video": true

### Pre-commit hook

`husky` configures the git hooks. https://github.com/typicode/husky  
`lint-staged` runs scripts on matched staged source files. https://github.com/okonet/lint-staged  
There is no need to manually configure anything. Just by installing the dependencies, the git hooks are configured.

### Scripts

| Command | Description |
|---------|-------------|
|´prepare´| Adding the pre-commit hooks with Husky. |
|´prebuild´| Executing a yarn clean command. |
|´build´| Build the project with webpack. |
|´start´| Run the project with webpack. |
|´test´| Run the Jest test suite. |
|´test:ci´| Run the Jest test suite for the CI. |
|´format´| Format the code base with Prettier. |
|´format:check´| Do a format check, without updating the code. |
|´lint´| Do a linting check on the codebase. |
|´lint:fix´| Run the fix command from linter. |
|´build:bundle-profile´| |
|´bundle-profile:analyze´| |
|´clean´| Remove the dist folder. |
|´delete:reports´| Delete the test reports from cypress if the are present. |
|´precypress-test´| Delete the cypress reports. |
|´cypress-test´| Run the E2E test suite. |
|´package-cleanup´| Execute a node cleanup on the packages. |
|´check-circular-deps´| check for circular dependencies with madge. |
|´install:orchestrator´| Install and setup an docker container with the orchestrator. There are four named arguments you can pass to this command. `version` (iso/oss, it will default to iso), `release` (matching release tag for the version, defaults to 7-dev), `branch` (the branch on the frontend-test repo you want to target for the installation, will default to master), `flag` (The docker flag with which the exec command needs to be executed. If not passed, no flags will be used.) Example: `install:orchestrator version=oss release=dev tag=-ti branch=oss_case_1` |
|´install:orchestrator:iso´| Short hand command to install the latest iso version of the orchestrator. |
|´install:orchestrator:oss´| Short hand command to install the oss dev version of the orchestrator. |
|´install:orchestrator:ci´| Short hand command to install the latest iso version of the orchestrator for the CI. |
|´kill-server´| Terminate the docker container with the orchestrator. |
