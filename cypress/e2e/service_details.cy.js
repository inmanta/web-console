/// <reference types="Cypress" />
describe("Service catalog", function () {
  beforeEach(() => {
    cy.intercept("GET", "/api/v2/project?environment_details=false", {
      fixture: "environments.json",
    });
    cy.intercept("GET", "**/api/v1/serverstatus", {
      fixture: "serverstatus.json",
    });
    cy.intercept("GET", "/lsm/v1/service_inventory/e2e_service?**", {
      fixture: "lsm/service_inventory.json",
    });
    cy.intercept(
      "GET",
      "/lsm/v1/service_inventory/e2e_service/*/resources?current_version=*",
      { fixture: "lsm/resources.json" }
    );
    cy.intercept("GET", "/lsm/v1/service_catalog/e2e_service?**", {
      fixture: "lsm/service_catalog_single.json",
    });

    cy.visit(
      "/console/lsm/catalog/e2e_service/details?env=36cdbc7e-28a1-4803-e8c1-6743f52a594c"
    );
  });
  it("Has multiple entries based on backend response", function () {
    cy.get(".pf-c-tabs")
      .find(".pf-c-tabs__item")
      .find(".pf-c-tabs__link")
      .should("have.length", 5);
    cy.get(".pf-c-tabs")
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
    cy.contains("Lifecycle States").click();

    /**
     * @NOTE This assertion indirectly verifies that no full page rerender is triggered.
     * We do not have the prop unMountOnExit set to true for the Tabs component.
     * This means, the TabContent of previous viewed tabs is not destroyed.
     * So here we correctly assume there are 2 TabContent components in the DOM.
     */
    cy.get(".pf-c-page__main-section")
      .find(".pf-c-tab-content")
      .should("have.length", 2);

    cy.get(".pf-c-page__main-section")
      .find(".pf-c-tab-content")
      .first()
      .should("not.be.visible");

    cy.get(".pf-c-page__main-section")
      .find(".pf-c-tab-content")
      .last()
      .should("be.visible");

    cy.contains("Config").click();

    cy.get(".pf-c-page__main-section")
      .find(".pf-c-tab-content")
      .should("have.length", 3);
  });
});
