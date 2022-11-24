/// <reference types="Cypress" />
describe("Service catalog", function () {
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

    cy.visit("/console/lsm/catalog?env=36cdbc7e-28a1-4803-e8c1-6743f52a594c");
  });
  it("Has multiple entries based on backend response", function () {
    cy.get(".pf-c-data-list__item").should("have.length", 2);
  });
});
