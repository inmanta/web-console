/// <reference types="Cypress" />
describe("Environment selector", function () {
  it("Has multiple entries based on backend response", function () {
    cy.intercept("GET", "**/api/v2/project", {
      fixture: "environments.json",
    });
    cy.visit("/lsm/catalog");
    cy.get(".pf-c-context-selector__toggle").click();

    cy.get(".pf-c-context-selector__menu-list-item").should((items) => {
      let texts = items.map((idx, item) => Cypress.$(item).text());

      texts = texts.get();
      expect(texts).to.have.length(2);
      expect(texts).to.deep.eq([
        "demo (End-to-end Service Orchestration Demo)",
        "live (End-to-end Service Orchestration Demo)",
      ]);
    });
  });
  it("Has correct entry selected when env parameter is set", function () {
    cy.intercept("GET", "/api/v2/project", { fixture: "environments.json" });
    cy.visit("/lsm/catalog?env=36cdbc7e-28a1-4803-e8c1-6743f52a594c");
    cy.get(".pf-c-context-selector__toggle-text").should(
      "contain.text",
      "live"
    );
  });
  it("Displays a warning when the environment from the url doesn't exist", function () {
    cy.intercept("GET", "**/api/v2/project", { fixture: "environments.json" });
    cy.visit("/lsm/catalog?env=nope");
    cy.get("#env-warning-alert").should("exist");
    cy.get("#close-env-warning-button").click();
    cy.get("#env-warning-alert").should("not.exist");
  });
});
