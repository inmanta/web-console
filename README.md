# web-console

    yarn # install dependencies

    yarn build # build the project

    yarn start # start the development server

    yarn test # run the test suite

    yarn lint # Run the linter

    yarn format # Run the code formatter 

    yarn bundle-profile:analyze # Launch a tool to inspect the bundle size

    yarn cypress-test # Run tests with Cypress

To enable authentication with keycloak, you can use environment variables, e.g. add the following variable to a dotenv (`.env` in the root of the project) file (further information on <https://github.com/motdotla/dotenv>)

    SHOULD_USE_AUTH=true

You can also specify the url of the keycloak server in the same file:

    KEYCLOAK_URL=<Your keycloak server url>

Alternatively, the keycloak parameters can also be specified in an external file in the production environment, called config.js, following the example src/config.js file.

The base url of the backend services can also be specified here, e.g.:

    API_BASEURL=http://localhost:8888

Cypress can be configured via cypress.json (or command line arguments), e.g. to record videos of each test run:

    "video": true
