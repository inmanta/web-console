import environmentHelpers from "../support/environmentHelpers";

const { clearEnvironment, forceUpdateEnvironment } = environmentHelpers;

const isIso = Cypress.expose("edition") === "iso";

if (isIso) {
  describe("Scenario 2.2 Service Catalog - Parent/Children Service", () => {
    before(() => {
      clearEnvironment();
      forceUpdateEnvironment();
    });
    it("2.2.1 Add Instance on parent-service", () => {
      cy.visit("/console/");
      cy.get('[aria-label="Select-environment-test"]').click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#parent-service").contains("Show inventory").click();
      cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");
      // Add an instance and fill form
      cy.get("#add-instance-button").click();
      cy.get("#service_id").type("0001");
      cy.get("#name").type("parent");
      cy.get("button").contains("Confirm").click();

      cy.get('[aria-label="Instance-Details-Success"]', {
        timeout: 20000,
      }).should("to.be.visible");

      // Check the state of the instance is up in the history section.
      cy.get('[aria-label="History-Row"]', { timeout: 90000 }).should("contain", "up");

      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#parent-service").contains("Show inventory").click();

      // Should show the ServiceInventory-Success Component.
      cy.get('[aria-label="ServiceInventory-Success"]').should("to.be.visible");
      // Check if only one row has been added to the table.
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);

      // click on service catalog in breadcrumb
      cy.get('[aria-label="BreadcrumbItem"]').contains("Service Catalog").click();

      // click show inventory on child-service
      cy.get("#child-service").contains("Show inventory").click();
      cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");
      // Add an instance and fill form
      cy.get("#add-instance-button").click();
      cy.get("#service_id").type("0002");
      cy.get("#name").type("child");
      cy.get('[aria-label="parent_entity-select-toggleFilterInput"]').click();
      cy.get('[role="option"]').first().click();
      cy.get("button").contains("Confirm").click();

      cy.get('[aria-label="Instance-Details-Success"]', {
        timeout: 20000,
      }).should("to.be.visible");

      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#child-service").contains("Show inventory").click();

      cy.get('[aria-label="ServiceInventory-Success"]').should("to.be.visible");

      // Check if only one row has been added to the table.
      cy.get('[aria-label="InstanceRow-Intro"]', { timeout: 20000 }).should("have.length", 1);
    });
    it("2.2.2 Remove Parent Service and Child Service", () => {
      cy.visit("/console/");

      cy.get('[aria-label="Select-environment-test"]').click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#parent-service").contains("Show inventory").click();
      cy.get('[data-label="State"]').eq(0, { timeout: 90000 }).should("have.text", "up");

      // try delete item (Should not be possible)
      cy.get('[aria-label="row actions toggle"]', { timeout: 60000 }).click();
      cy.get('[role="menuitem"]').contains("Delete").click();

      cy.get(".pf-v6-c-modal-box__header").should("contain", "Delete instance");
      cy.get(".pf-v6-c-form__actions").contains("Yes").click();

      // click on service catalog in breadcrumb
      cy.get('[aria-label="BreadcrumbItem"]').contains("Service Catalog").click();

      cy.get("#child-service").contains("Show inventory").click();
      cy.get('[data-label="State"]').eq(0, { timeout: 90000 }).should("have.text", "up");
      // try delete item (Should be possible)
      cy.get('[aria-label="row actions toggle"]', { timeout: 60000 }).click();
      cy.get('[role="menuitem"]').contains("Delete").click();

      cy.get(".pf-v6-c-modal-box__header").should("contain", "Delete instance");
      cy.get(".pf-v6-c-form__actions").contains("Yes").click();

      cy.get('[aria-label="ServiceInventory-Empty"]', {
        timeout: 120000,
      }).should("to.be.visible");
    });
  });
}
