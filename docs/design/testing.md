## Testing

Focus is functional testing. General guideline is that no feature or complex logic should be left untested.
Optimally, test at the lowest possible level, to save time and resources, and also to reduce test complexity.

We might have to consider other approaches, like performance (e.g. page load time) testing, and accessibility testing later. This is out of scope for this document.

### Test levels

- Unit tests: Small scope (component, function, class). Not absolutely necessary for presentational components. Strongly recommended for any component used by multiple pages
- ???: Integration of multiple components, data passed in via props - might not need a specific name
- Integration tests: Test a whole page, data passed in via data provider (`Spec`)
- ??? (Cypress) tests: Test whole application loaded to browser. For navigation / changing urls?
- E2E tests (Cypress): Test the integration with the backend. Can also include integration with keycloak server.

### Tooling

- Jest as the test runner for unit tests
- React Testing library for rendering (partial) component trees
- Cypress when testing the whole application (with backend integration) is necessary.
  - Cypress tests now use Electron. Should we consider running them with multiple browsers?
- Do we need / want some BDD support?
