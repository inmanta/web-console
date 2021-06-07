/// <reference types="Cypress" />
describe("Navigation", function () {
  beforeEach(() => {
    cy.intercept("GET", "/api/v2/project", { fixture: "environments.json" });
    cy.intercept("GET", "/lsm/v1/service_catalog**", {
      fixture: "lsm/service_catalog.json",
    });
    cy.intercept("GET", "/lsm/v1/service_inventory/e2e_service", {
      fixture: "lsm/service_inventory.json",
    });
  });
  it("Button and breadcrumb navigation should change the url", function () {
    cy.visit("/lsm/catalog");
    cy.get(".pf-c-data-list__item-action")
      .first()
      .find(".pf-m-primary")
      .click();
    cy.url().should("include", "inventory");
    cy.get(".pf-c-breadcrumb__item").first().click();
    cy.url().should("not.include", "inventory");
  });
});
