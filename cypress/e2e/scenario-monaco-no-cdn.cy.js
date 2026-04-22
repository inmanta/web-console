/**
 * Smoke-test that Monaco never fetches from a CDN.
 * More targeted checks live alongside each Monaco-using scenario via
 * cy.startMonacoCDNCheck() / cy.assertNoCDNDownloads() (see support/monacoHelpers.js).
 */
describe("Monaco Editor - no CDN downloads", () => {
  it("loads Monaco without fetching from cdn.jsdelivr.net or esm.sh", () => {
    cy.startMonacoCDNCheck();

    // GraphiQL renders Monaco unconditionally and works without a selected environment.
    cy.visit("/console/graphiql");

    cy.get(".monaco-editor", { timeout: 15000 }).should("exist");

    cy.assertNoCDNDownloads();
  });
});
