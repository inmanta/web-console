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

/**
 * when ID of the environment is not yet known, use this method to wait for the compile to be terminated.
 */
const waitForCompile = () => {
  cy.url().then((url) => {
    const location = new URL(url);
    const id = location.searchParams.get("env");
    checkStatusCompile(id);
  });
};

before(() => {
  clearEnvironment();
  forceUpdateEnvironment();
});

describe("Scenario 2.3 Service Catalog - embedded-entity", () => {
  it("2.3.1 - Add instance", () => {
    // Go from Home page to Service Inventory of embedded-service
    cy.visit("/console/");

    cy.get('[aria-label="Environment card"]').contains("lsm-frontend").click();
    cy.get("#embedded-entity-service").contains("Show inventory").click();

    // make sure the call to get inventory has been executed
    cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");

    // Add an instance and fill form
    cy.get("#add-instance-button").click();
    cy.get("#service_id").type("0001");
    cy.get("#name").type("embedded-entity");

    //open dropdown for first assigment to fill up the forms
    cy.get('[aria-label="NestedFieldInput-vlan_assigment_r1"]')
      .find("button")
      .click();
    cy.get("#router_ip").type("1.2.3.4");
    cy.get("#interface_name").type("eth0");
    cy.get("#address").type("1.2.3.5/32");
    cy.get("#vlan_id").type("1");

    //close first dropdown and open the second one to fill up the forms
    cy.get('[aria-label="NestedFieldInput-vlan_assigment_r1"]')
      .find("button")
      .click();
    cy.get('[aria-label="NestedFieldInput-vlan_assigment_r2"]')
      .find("button")
      .click();
    cy.get("#router_ip").type("1.2.3.6");
    cy.get("#interface_name").type("interface-vlan");
    cy.get("#address").type("1.2.3.7/32");
    cy.get("#vlan_id").type("3");
    cy.get("button").contains("Confirm").click();
    // check if the view is still empty, also means we have been redirected as expected.
    cy.get('[aria-label="ServiceInventory-Success"]').should("to.be.visible");
  });

  it("2.3.2 - show diagonse view", () => {
    // Go from Home page to Service Inventory of Embedded-service
    cy.visit("/console/");
    cy.get('[aria-label="Environment card"]').contains("lsm-frontend").click();
    // Expect to find one badge on the embedded-service row.
    cy.get("#embedded-entity-service")
      .get('[aria-label="Number of instances by label"]')
      .children()
      .should("have.length", 1);
    cy.get("#embedded-entity-service").contains("Show inventory").click();
    cy.get('[aria-label="ServiceInventory-Success"]').should("to.be.visible");
    cy.get("#expand-toggle0").click();

    // expect row to be expanded
    cy.get(".pf-c-table__expandable-row-content").should("to.be.visible");

    // Expect to find status tab
    cy.get(".pf-c-tabs__list li:first").should("have.class", "pf-m-current");

    cy.get(".pf-c-description-list").contains("Diagnose").click();

    // Diagonse sub-page should open and be empty
    cy.get("h1").contains("Diagnose Service Instance").should("be.visible");
    cy.get('[aria-label="Diagnostics-Empty"]').should("be.visible");
    cy.visit("/console/");
  });

  it("2.3.3 - Show history view", () => {
    cy.visit("/console/");
    cy.get('[aria-label="Environment card"]').contains("lsm-frontend").click();
    // Expect to find one badge on the embedded-service row.
    cy.get("#embedded-entity-service")
      .get('[aria-label="Number of instances by label"]')
      .children()
      .should("have.length", 1);
    cy.get("#embedded-entity-service").contains("Show inventory").click();
    cy.get("#expand-toggle0").click();

    // expect row to be expanded
    cy.get(".pf-c-table__expandable-row-content").should("to.be.visible");

    // Expect to find status tab
    cy.get(".pf-c-tabs__list li:first").should("have.class", "pf-m-current");
    //await for instance state to change to up
    cy.get('[data-label="State"]')
      .find(".pf-c-label.pf-m-green", { timeout: 60000 })
      .should("contain", "up");

    cy.get(".pf-c-description-list").contains("History").click();

    // History sub-page should open and be empty then go to Home page
    cy.get("h1").contains("Service Instance History").should("be.visible");
    // due to lack of Id in rows I had to assert that each toggle button is separeate history log
    cy.get(".pf-c-table").find(".pf-c-table__toggle").should("have.length", 3);
    cy.visit("/console/");
  });

  it("2.1.4 Delete previously created instance", () => {
    cy.visit("/console/");

    cy.get('[aria-label="Environment card"]').contains("lsm-frontend").click();
    cy.get("#embedded-entity-service").contains("Show inventory").click();

    // expand first row
    cy.get("#expand-toggle0", { timeout: 20000 }).click();

    // There might be still a compile running because of the edit action. So we do a check if one is pending.
    waitForCompile();

    // delete but cancel deletion in modal
    cy.get(".pf-c-description-list").contains("Delete").click();
    cy.get(".pf-c-modal-box__title-text").should("contain", "Delete instance");
    cy.get(".pf-c-form__actions").contains("No").click();

    cy.get(".pf-c-description-list").contains("Delete").click();
    cy.get(".pf-c-modal-box__title-text").should("contain", "Delete instance");
    cy.get(".pf-c-form__actions").contains("Yes").click();

    // check response if instance has been deleted succesfully.
    cy.get('[aria-label="ServiceInventory-Empty"]', { timeout: 40000 }).should(
      "be.visible"
    );
  });
});
