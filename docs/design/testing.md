[Index](./index.md)

# Testing

The focus is functional testing. As a general guideline, no feature or complex logic should be left untested.
Optimally, test at the lowest possible level, to save time and resources, and also to reduce test complexity.
Also keep in mind that:

- reducing duplication is advantageous in test code and test setup code as well
- complex testing utilities might need their own unit tests
- don't forget error paths and edge cases
- test (and assert) the right thing
- the goal is to provide sufficient confidence in the system

We might have to consider other approaches, like performance (e.g. page load time) testing, and accessibility testing later. This is out of scope for this document.

## Test levels

- Unit tests: Small scope (component, function, class). Not absolutely necessary for presentational components. Strongly recommended for any component used by multiple pages
- Component-Integration tests: Integration of multiple components, data passed in via props
- Data-Integration tests: Test a whole page, data passed in via data provider
- Application (Cypress) tests: Test whole application loaded to browser. For navigation / changing urls
- E2E tests (Cypress): Test the integration with the backend. Can also include integration with keycloak server.

## Tooling

- `Jest` as the test runner for unit tests. This is one of the most popular javascript unit testing library, and the most commonly used with React.
- `React Testing Library` for rendering (partial) component trees. It's gaining popularity among the React projects, mostly because it's a lightweight black-box testing utility (in contrast to `Enzyme`, which relies on implementation details)
- `Cypress` when testing the whole application (optionally with backend integration) is necessary.
`Cypress` provides this capability in a much more stable way than `Selenium`. It's also easy to learn,
provides screenshot and video capture support (it also supports testing with multiple browsers, in case we need it in the future).
