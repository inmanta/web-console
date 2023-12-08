/**
 * Shorthand method to clear the environment being passed.
 * By default, if no arguments are passed it will target the 'lsm-frontend' environment.
 *
 * @param {string} nameEnvironment
 */
const clearEnvironment = (nameEnvironment = "lsm-frontend") => {
  cy.visit("/console/");
  cy.get('[aria-label="Environment card"]').contains(nameEnvironment).click();
  cy.url().then((url) => {
    const location = new URL(url);
    const id = location.searchParams.get("env");
    cy.request("DELETE", `/api/v1/decommission/${id}`);
  });
};

/**
 * based on the environment id, it will recursively check if a compile is pending.
 * It will continue the recursion as long as the statusCode is equal to 200
 *
 * @param {string} id
 */
const checkStatusCompile = (id) => {
  let statusCodeCompile = 200;

  if (statusCodeCompile === 200) {
    cy.intercept(`/api/v1/notify/${id}`).as("IsCompiling");
    // the timeout is necessary to avoid errors.
    // Cypress doesn't support while loops and this was the only workaround to wait till the statuscode is not 200 anymore.
    // the default timeout in cypress is 5000, but since we have recursion it goes into timeout for the nested awaits because of the recursion.
    cy.wait("@IsCompiling", { timeout: 15000 }).then((req) => {
      statusCodeCompile = req.response.statusCode;

      if (statusCodeCompile === 200) {
        checkStatusCompile(id);
      }
    });
  }
};

/**
 * Will by default execute the force update on the 'lsm-frontend' environment if no argumenst are being passed.
 * This method can be executed standalone, but is part of the cleanup cycle that is needed before running a scenario.
 *
 * @param {string} nameEnvironment
 */
const forceUpdateEnvironment = (nameEnvironment = "lsm-frontend") => {
  cy.visit("/console/");
  cy.get('[aria-label="Environment card"]').contains(nameEnvironment).click();
  cy.url().then((url) => {
    const location = new URL(url);
    const id = location.searchParams.get("env");
    cy.request({
      method: "POST",
      url: `/lsm/v1/exporter/export_service_definition`,
      headers: { "X-Inmanta-Tid": id },
      body: { force_update: true },
    });
    checkStatusCompile(id);
  });
};

if (Cypress.env("edition") === "iso") {
  describe("Scenario 2.2 Service Catalog - Parent/Children Service", () => {
    before(() => {
      clearEnvironment();
      forceUpdateEnvironment();
    });
    it("2.2.1 Add Instance on parent-service", () => {
      cy.visit("/console/");
      cy.get('[aria-label="Environment card"]')
        .contains("lsm-frontend")
        .click();
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();
      cy.get("#parent-service").contains("Show inventory").click();
      cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");
      // Add an instance and fill form
      cy.get("#add-instance-button").click();
      cy.get("#service_id").type("0001");
      cy.get("#name").type("parent");
      cy.get("button").contains("Confirm").click();

      // Should show the ServiceInventory-Success Component.
      cy.get('[aria-label="ServiceInventory-Success"]').should("to.be.visible");
      // Check if only one row has been added to the table.
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);

      // open row from element
      cy.get("#expand-toggle0").click();

      // Go to ressource tab expect it be empty
      cy.get(".pf-v5-c-tabs__item-text").contains("Resources").click();
      cy.get('[aria-label="ResourceTable-Empty"]').should("to.be.visible");

      cy.intercept("**/resources**").as("GetVersion");

      // expect one item with deployed state
      cy.get('[aria-label="ResourceTable-Success"]', { timeout: 60000 }).should(
        ($table) => {
          expect($table).to.have.length(1);

          const $td = $table.find("td");
          // there can only be 2 table-data cells available
          expect($td).to.have.length(2);
          expect($td.eq(0), "first item").to.have.text(
            "frontend_model::TestResource[internal,name=default-0001]",
          );
          expect($td.eq(1), "second item").to.have.text("deployed");
        },
      );

      // click on service catalog in breadcrumb
      cy.get('[aria-label="BreadcrumbItem"]')
        .contains("Service Catalog")
        .click();

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
      // Expect to be redirected to service inventory
      cy.get('[aria-label="ServiceInventory-Success"]').should("to.be.visible");

      // Check if only one row has been added to the table.
      cy.get('[aria-label="InstanceRow-Intro"]', { timeout: 20000 }).should(
        "have.length",
        1,
      );
    });
    it("2.2.2 Remove Parent Service and Child Service", () => {
      cy.visit("/console/");

      cy.get('[aria-label="Environment card"]')
        .contains("lsm-frontend")
        .click();
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();
      cy.get("#parent-service").contains("Show inventory").click();

      // open row from element
      cy.get("#expand-toggle0", { timeout: 20000 }).click();

      // try delete item (Should not be possible)
      cy.get('[aria-label="row actions toggle"]', { timeout: 60000 }).click();
      cy.get(".pf-v5-c-menu__item").contains("More actions").click();
      cy.get(".pf-v5-c-menu__item").contains("Delete").click();

      cy.get(".pf-v5-c-modal-box__title-text").should(
        "contain",
        "Delete instance",
      );
      cy.get(".pf-v5-c-form__actions").contains("Yes").click();

      // check status change before compile
      cy.get('[aria-label="InstanceRow-Intro"]:first', { timeout: 20000 })
        .find('[data-label="State"]')
        .should("contain", "delete_validating_up");

      cy.get('[aria-label="InstanceRow-Intro"]:first')
        .find('[data-label="State"]', { timeout: 60000 })
        .should("not.contain", "delete_validating_up");

      // click on service catalog in breadcrumb
      cy.get('[aria-label="BreadcrumbItem"]')
        .contains("Service Catalog")
        .click();

      cy.get("#child-service").contains("Show inventory").click();

      // open row from element
      cy.get("#expand-toggle0").click();

      // try delete item (Should be possible)
      cy.get('[aria-label="row actions toggle"]', { timeout: 60000 }).click();
      cy.get(".pf-v5-c-menu__item").contains("More actions").click();
      cy.get(".pf-v5-c-menu__item").contains("Delete").click();

      cy.get(".pf-v5-c-modal-box__title-text").should(
        "contain",
        "Delete instance",
      );
      cy.get(".pf-v5-c-form__actions").contains("Yes").click();

      cy.get('[aria-label="ServiceInventory-Empty"]', {
        timeout: 220000,
      }).should("to.be.visible");
    });
  });
}
