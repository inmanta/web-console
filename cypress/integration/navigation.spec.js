/// <reference types="Cypress" />
describe("Navigation", function () {
  beforeEach(() => {
    cy.server();
    cy.route({
      method: "GET",
      url: "**/api/v2/project",
      response: "fixture:environments.json",
    });
    cy.route({
      method: "GET",
      url: "**/lsm/v1/service_catalog",
      response: "fixture:lsm/service_catalog.json",
    });
    cy.route({
      method: "GET",
      url: "**/lsm/v1/service_inventory/e2e_service",
      response: "fixture:lsm/service_inventory.json",
    });
    cy.route({
      method: "GET",
      url: "**/lsm/v1/service_inventory/e2e_service/**/resources?current_version=**",
      response: "fixture:lsm/resources.json",
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
