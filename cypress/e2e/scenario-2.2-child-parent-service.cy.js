import environmentHelpers from "../support/environmentHelpers.js";

const { clearEnvironment, forceUpdateEnvironment, selectEnvironment } = environmentHelpers;

const isIso = Cypress.expose("edition") === "iso";

if (isIso) {
  describe("Scenario 2.2 Service Catalog - Parent/Children Service", () => {
    before(() => {
      clearEnvironment();
      forceUpdateEnvironment();
    });
    it("2.2.1 Add Instance on parent-service", () => {
      cy.visit("/console/");
      selectEnvironment();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#parent-service").contains("Inventory").click();
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

      // The catalog row of the parent counts its instance in a status label, whose tooltip
      // breaks the count down per state.
      cy.get('#parent-service [aria-label="Number of instances by label"]')
        .should("have.text", "1")
        .find('[tabindex="0"]')
        .trigger("mouseenter");
      cy.contains('[role="tooltip"]', "success").should("be.visible").and("contain", "up");

      cy.get("#parent-service").contains("Inventory").click();

      // Should show the ServiceInventory-Success Component.
      cy.get('[aria-label="ServiceInventory-Success"]').should("to.be.visible");
      // Check if only one row has been added to the table.
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);

      // click on service catalog in breadcrumb
      cy.get('[aria-label="BreadcrumbItem"]').contains("Service Catalog").click();

      // child-service is owned by parent-service, so it stays hidden until its owner is expanded
      cy.get("#child-service").should("not.be.visible");
      cy.get("#parent-service-toggle").should("have.text", "1 owned service").click();
      cy.get("#child-service").should("be.visible");
      cy.get("#parent-service-toggle").click();
      cy.get("#child-service").should("not.be.visible");
      cy.get("button").contains("Expand all").click();
      cy.get("#child-service").contains("Inventory").click();
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
      // Filtering on an owned service shows it under its expanded owner.
      cy.get('[aria-label="Filter services"]').type("child-service");
      cy.get("#basic-service").should("not.exist");
      cy.get("#child-service").should("be.visible");
      // The clear button of the filter brings back the whole catalog.
      cy.get('[aria-label="ServiceCatalog-Success"]').find('button[aria-label="Reset"]').click();
      cy.get('[aria-label="Filter services"]').should("have.value", "");
      cy.get("#basic-service").should("be.visible");
      cy.get('[aria-label="Filter services"]').type("child-service");
      cy.get("#child-service").contains("Inventory").click();

      cy.get('[aria-label="ServiceInventory-Success"]').should("to.be.visible");

      // Check if only one row has been added to the table.
      cy.get('[aria-label="InstanceRow-Intro"]', { timeout: 20000 }).should("have.length", 1);
    });
    it("2.2.2 Remove Parent Service and Child Service", () => {
      cy.visit("/console/");
      selectEnvironment();

      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#parent-service").contains("Inventory").click();
      cy.get('[data-label="State"]').eq(0, { timeout: 90000 }).should("have.text", "up");

      // try delete item (Should not be possible)
      cy.get('[aria-label="row actions toggle"]', { timeout: 60000 }).click();
      cy.get('[role="menuitem"]').contains("Delete").click();

      cy.get(".pf-v6-c-modal-box__header").should("contain", "Delete instance");
      cy.get(".pf-v6-c-form__actions").contains("Yes").click();

      // click on service catalog in breadcrumb
      cy.get('[aria-label="BreadcrumbItem"]').contains("Service Catalog").click();

      cy.get("button").contains("Expand all").click();
      cy.get("#child-service").contains("Inventory").click();
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
