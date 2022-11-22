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
  it("Should show error message when deleting is not successful", function () {
    cy.intercept("DELETE", "/lsm/v1/service_catalog/e2e_service", {
      statusCode: 400,
      body: {
        message:
          "Invalid request: Cannot delete service entity e2e_service of environment 36cdbc7e-28a1-4803-b7b2-6743f52a594c because it still has service instances.",
      },
    });
    cy.contains("#pf-dropdown-toggle-id-0").click();
    cy.contains("Delete").click();
    cy.contains("Yes").click();
    cy.get(".pf-c-alert.pf-m-danger").should("contain.text", "Cannot delete");
  });
  it("Should send correct network request when deleting", function () {
    cy.intercept("DELETE", "/lsm/v1/service_catalog/e2e_service", {
      body: {},
      statusCode: 200,
    }).as("deleteEntity");
    cy.contains("#pf-dropdown-toggle-id-0").click();
    cy.contains("Delete").click();
    cy.contains("Yes").click();
    cy.wait("@deleteEntity").then(({ response }) => {
      expect(response.statusCode).to.eq(200);
    });
  });
});
