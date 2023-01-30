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

before(() => {
  clearEnvironment();
  forceUpdateEnvironment();
});

describe("Scenario 6 : Resources", () => {
  it("6.1 Initial state", () => {
    // Select Test environment
    cy.visit("/console/");

    cy.get('[aria-label="Environment card"]').contains("lsm-frontend").click();

    // Go to Resources page by clicking on navbar
    cy.get(".pf-c-nav__link").contains("Resources").click();

    // Expect 0/0 resources to be visible
    cy.get('[aria-label="Deployment state summary"]').should(
      "contain",
      "0 / 0"
    );
    // Expect table to be empty
    cy.get('[aria-label="ResourcesView-Empty"]').should("to.be.visible");
  });
  it("6.2 Add instance on a basic-service", () => {
    // Select Test environment
    cy.visit("/console/");

    cy.get('[aria-label="Environment card"]').contains("lsm-frontend").click();

    // Go to Service Catalog
    cy.get(".pf-c-nav__link").contains("Service Catalog").click();

    // Select Show Inventory on basic-service
    cy.get("#basic-service").contains("Show inventory").click();

    // Add instance
    cy.get("#add-instance-button").click();
    cy.get("#ip_r1").type("1.2.3.4");
    cy.get("#interface_r1_name").type("eth0");
    cy.get("#address_r1").type("1.2.3.5");
    cy.get("#vlan_id_r1").type("1");
    cy.get("#ip_r2").type("1.2.2.1");
    cy.get("#interface_r2_name").type("interface-vlan");
    cy.get("#address_r2").type("1.2.2.3");
    cy.get("#vlan_id_r2").type("2");
    cy.get("#service_id").type("0001");
    cy.get("#name").type("basic-service");
    cy.get("button").contains("Confirm").click();

    cy.get(".pf-c-chart").should("be.visible");

    // Go back to Resources page
    cy.get(".pf-c-nav__link").contains("Resources").click();

    // Expect two rows to be added to the table

    // lsm::LifecycleTransfer
    // frontend_model::TestResource
    // click on frontend_model::TestResource Show Details
    // Expect to find this information in table :
    // Click on Requires tab
    // Expect it to be empty
    // Click on history tab
    // Expect One row to be visible
    // Expect row to have 0 dependencies
    // click row open
    // Expect content to be the same as on main Desired State tab
    // Expect requires tab to have no requirements
    // Go to logs tab
    // Expect it to have :
    // 8 log messages
    // Expect last log message to be "Setting deployed due to known good status"
    // Click top message open
    // Expect to find "Setting deployed due to known good status" displayed in expansion.
  });
  it("6.3 Log message filtering", () => {
    // Filter on "INFO" for Minimal Log Level
    // expect to find only "INFO" rows
    // Click on clear filters
    // Expect to find "INFO" and "DEBUG" rows
  });
  it("6.4 Resources with multiple dependencies", () => {
    // Go to Service Catalog
    // Click on Show Inventory on dependency-service
    // add instance
    // Expect instance to be created
    // Go to Ressource page
    // Expect to find a resource with value:
    // a
    // b
    // c
    // 0009
    // waiting-entity
    // Expect resource with value a,b,c,0009 to have 0 dependencies
    // Expect resource with value 0009 to have 3 dependencies
    // Click open collapsible row for resource waiting-entity
    // Expect to find three rows with
    // frontend_model::TestResource[internal,name=a]
    // frontend_model::TestResource[internal,name=b]
    // frontend_model::TestResource[internal,name=c]
    // click on show details on waiting-entity
    // go to require tab
    // expect again to find
    // frontend_model::TestResource[internal,name=a]
    // frontend_model::TestResource[internal,name=b]
    // frontend_model::TestResource[internal,name=c]
    // go to history tab
    // expect to find one collapsible with 3 dependencies
    // go back to requires tab
    // click on first required resource link frontend_model::TestResource[internal,name=a]
    // store url from this page
    // go back to Resource page
    // click open resource with value waiting-entity
    // click on first resource frontend_model::TestResource[internal,name=a]
    // Expect to be on the same location as stored url.
    // go back to home
  });
});
