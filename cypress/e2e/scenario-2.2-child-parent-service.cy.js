/**
 * Shorthand method to clear the environment being passed.
 * By default, if no arguments are passed it will target the 'lsm-frontend' environment.
 *
 * @param {string} nameEnvironment
 */
const clearEnvironment = (nameEnvironment = "test") => {
  cy.visit("/console/");
  cy.get(`[aria-label="Select-environment-${nameEnvironment}"]`).click();
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
    cy.intercept("/api/v2/graphql").as("IsCompiling");
    // the timeout is necessary to avoid errors.
    // Cypress doesn't support while loops and this was the only workaround to wait till the statuscode is not 200 anymore.
    // the default timeout in cypress is 5000, but since we have recursion it goes into timeout for the nested awaits because of the recursion.
    cy.wait("@IsCompiling", { timeout: 10000 }).then((req) => {
      statusCodeCompile = req.response.statusCode;
      const environments = req.response.body.data.data.environments;

      if (environments) {
        const edges = environments.edges;

        if (edges && edges.length > 0) {
          const environment = edges.find((env) => env.node.id === id);

          if (environment && !environment.node.isCompiling) {
            return;
          }
        }
      } 

      checkStatusCompile(id);
    });
  }
};

/**
 * Will by default execute the force update on the 'lsm-frontend' environment if no argumenst are being passed.
 * This method can be executed standalone, but is part of the cleanup cycle that is needed before running a scenario.
 *
 * @param {string} nameEnvironment
 */
const forceUpdateEnvironment = (nameEnvironment = "test") => {
  cy.visit("/console/");
  cy.get(`[aria-label="Select-environment-${nameEnvironment}"]`).click();
  cy.url().then((url) => {
    const location = new URL(url);
    const id = location.searchParams.get("env");

    cy.request({
      method: "POST",
      url: "/lsm/v1/exporter/export_service_definition",
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
