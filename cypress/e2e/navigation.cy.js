/// <reference types="Cypress" />
describe("Navigation", function () {
  beforeEach(() => {
    cy.intercept("GET", "/api/v2/project?environment_details=false", {
      fixture: "environments.json",
    });
    cy.intercept("GET", "**/api/v1/serverstatus", {
      fixture: "serverstatus.json",
    });
    cy.intercept("GET", "/lsm/v1/service_catalog**", {
      fixture: "lsm/service_catalog.json",
    });
    cy.intercept("GET", "/lsm/v1/service_inventory/e2e_service", {
      fixture: "lsm/service_inventory.json",
    });
  });
  it("Button and breadcrumb navigation should change the url", function () {
    cy.visit("/console/lsm/catalog?env=36cdbc7e-28a1-4803-e8c1-6743f52a594c");
    cy.get(".pf-c-data-list__item-action")
      .first()
      .find(".pf-m-primary")
      .click();
    cy.url().should("include", "inventory");
    cy.get(".pf-c-breadcrumb__item").first().click();
    cy.url().should("not.include", "inventory");
  });
});
