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
    cy.wait("@IsCompiling").then((req) => {
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

before(() => {
  clearEnvironment();
  forceUpdateEnvironment();
});

describe("Scenario 2.4 Service Catalog - update", () => {
  it("2.4.1 Add Instance Cancel form", () => {
    // Go from Home page to Service Inventory of Basic-service
    cy.visit("/console/");
    //open Environment
    cy.get('[aria-label="Environment card"]').contains("lsm-frontend").click();
    cy.get(".pf-c-nav__item").contains("Service Catalog").click();
    cy.get('[aria-label="ServiceCatalog-Success"]').should("to.be.visible");
    //click update button then cancel popup
    cy.get("button").contains("Update Service Catalog").click();
    cy.get(".pf-c-modal-box").should("to.be.visible");
    cy.get("#cancel").click();
    cy.get(".pf-c-alert").should("to.not.exist");
    //click update button and confirm the popup
    cy.get("button").contains("Update Service Catalog").click();
    cy.get("#submit").click();
    cy.get(".pf-c-alert")
      .contains("The update has been requested")
      .should("to.be.visible");
    //find newest compile report
    cy.get(".pf-c-nav__link").contains("Compile Reports").click();
    cy.get('[aria-label="Compile Reports Table Row"]')
      .eq(0)
      .find('[data-label="Message"]')
      .should("have.text", "Recompile model to export service definition");
  });
});
