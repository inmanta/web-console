/// <reference types="Cypress" />
describe("Service inventory", function () {
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
  });

  it("Should show/hide resources tab on click", function () {
    cy.visit(
      "/console/lsm/catalog/e2e_service/inventory?env=36cdbc7e-28a1-4803-e8c1-6743f52a594c"
    );
    // click first toggle for expansion
    cy.get("#expand-toggle0").click();
    // click resources tab
    cy.get(".pf-c-tabs").contains("Resources").click();
    // expect deployed to be in the State cell
    cy.get('td[data-label="State"]').should("include.text", "deployed");
    // click toggle again to close the expansion
    cy.get("#expand-toggle0").click();
    // expect resources tab to not be visible
    cy.get(".pf-c-tabs").contains("Resources").should("not.be.visible");
  });
  it("Should show/hide add instance page on click", function () {
    cy.visit(
      "/console/lsm/catalog/e2e_service/inventory?env=36cdbc7e-28a1-4803-e8c1-6743f52a594c"
    );
    cy.get("#add-instance-button").click();
    cy.contains("Cancel").click().should("not.exist");
  });
  it("Should show error message when deleting is not allowed", function () {
    cy.intercept(
      "DELETE",
      "/lsm/v1/service_inventory/e2e_service/78ac51dd-ee5b-4e22-9bf0-54bce9664b4e?current_version=3",
      {
        statusCode: 400,
        body: {
          message:
            "Invalid request: Cannot delete service instance 78ac51dd-ee5b-4e22-9bf0-54bce9664b4e",
        },
      }
    );
    cy.visit(
      "/console/lsm/catalog/e2e_service/inventory?env=36cdbc7e-28a1-4803-e8c1-6743f52a594c"
    );
    cy.get("button#expand-toggle0").click();
    cy.contains("button", "Delete").click();
    cy.contains("button", "Yes").click();
    cy.get(".pf-c-alert.pf-m-danger").should("contain.text", "Bad Request");
  });
  it("Should show attributes tab when clicking on attribute summary", function () {
    cy.visit(
      "/console/lsm/catalog/e2e_service/inventory?env=36cdbc7e-28a1-4803-e8c1-6743f52a594c"
    );
    cy.get("#instance-row-summary-78ac").click();
    cy.get('[data-testid="attributes-tree-table-78ac"]').should("be.visible");
  });
  it("Should show resources tab when clicking on resource deployment progress", function () {
    cy.visit(
      "/console/lsm/catalog/e2e_service/inventory?env=36cdbc7e-28a1-4803-e8c1-6743f52a594c"
    );
    cy.get("#instance-row-resources-78ac").click();
    cy.get(
      "#resource-table-header-78ac51dd-ee5b-4e22-9bf0-54bce9664b4e"
    ).should("be.visible");
  });
});
