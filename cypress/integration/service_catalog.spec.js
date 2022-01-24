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
    cy.get("#e2e_service-toggle").click();
    cy.get("#e2e_service-expand")
      .find(".pf-c-tabs__item")
      .find(".pf-c-tabs__link")
      .should("have.length", 5);
    cy.get("#e2e_service-expand")
      .find(".pf-c-tabs__item")
      .find(".pf-c-tabs__link")
      .then((tabs) => {
        let texts = tabs.map((idx, tab) => Cypress.$(tab).text());

        texts = texts.get();
        expect(texts).to.deep.eq([
          "Details",
          "Attributes",
          "Lifecycle States",
          "Config",
          "Callbacks",
        ]);
      });
  });
  it("Should navigate between tabs", function () {
    cy.get("#e2e_service-toggle").click();
    cy.get("#e2e_service-expand")
      .find(".pf-c-tab-content")
      .should("have.length", 1);

    cy.get("#e2e_service-expand")
      .find(".pf-c-tab-content")
      .first()
      .should("be.visible");

    cy.contains("Lifecycle States").click();

    /**
     * @NOTE This assertion indirectly verifies that no full page rerender is triggered.
     * We do not have the prop unMountOnExit set to true for the Tabs component.
     * This means, the TabContent of previous viewed tabs is not destroyed.
     * So here we correctly assume there are 2 TabContent components in the DOM.
     */
    cy.get("#e2e_service-expand")
      .find(".pf-c-tab-content")
      .should("have.length", 2);

    cy.get("#e2e_service-expand")
      .find(".pf-c-tab-content")
      .first()
      .should("not.be.visible");

    cy.get("#e2e_service-expand")
      .find(".pf-c-tab-content")
      .last()
      .should("be.visible");

    cy.contains("Config").click();

    cy.get("#e2e_service-expand")
      .find(".pf-c-tab-content")
      .should("have.length", 3);
  });
  it("Should open multiple items in data list", function () {
    cy.get("#e2e_service-toggle").click();
    cy.get("#another_e2e_service-toggle").click();

    cy.get("#e2e_service-expand")
      .find(".pf-c-tab-content")
      .first()
      .should("be.visible");
    cy.get("#another_e2e_service-expand").scrollIntoView();
    cy.get("#another_e2e_service-expand")
      .find(".pf-c-tab-content")
      .first()
      .should("be.visible");
  });
  it("Should show error message when deleting is not successful", function () {
    cy.intercept("DELETE", "/lsm/v1/service_catalog/e2e_service", {
      statusCode: 400,
      body: {
        message:
          "Invalid request: Cannot delete service entity e2e_service of environment 36cdbc7e-28a1-4803-b7b2-6743f52a594c because it still has service instances.",
      },
    });
    cy.get("#e2e_service-toggle").click();
    cy.get(".pf-m-expanded").contains("Delete").click();
    cy.contains("Yes").click();
    cy.get(".pf-c-alert.pf-m-danger").should("contain.text", "Bad Request");
  });
  it("Should send correct network request when deleting", function () {
    cy.intercept("DELETE", "/lsm/v1/service_catalog/e2e_service", {
      body: {},
      statusCode: 200,
    }).as("deleteEntity");
    cy.get("#e2e_service-toggle").click();
    cy.get(".pf-m-expanded").contains("Delete").click();
    cy.contains("Yes").click();
    cy.wait("@deleteEntity").then(({ response }) => {
      expect(response.statusCode).to.eq(200);
    });
  });
});
