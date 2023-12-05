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
  describe("Scenario 8 - Instance Composer", () => {
    before(() => {
      clearEnvironment();
      forceUpdateEnvironment();
    });

    it("8.1 Open empty Instance Composer", () => {
      // Select 'test' environment
      cy.visit("/console/");
      cy.get('[aria-label="Environment card"]')
        .contains("lsm-frontend")
        .click();
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();

      // click on Show Inventory on basic-service
      cy.get("#basic-service", { timeout: 60000 })
        .contains("Show inventory")
        .click();
      cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");

      // click on add instance
      cy.get("#add-instance-composer-button").click();

      // Create instance on basic-service
      cy.get(".canvas").should("be.visible");

      // Open basic-service isntance form
      cy.get('[aria-label="new-entity-button"]').click();
      cy.get('[aria-label="Options menu"]').click();
      cy.get(".pf-v5-c-select__menu-item").contains("basic-service").click();

      //fill form
      cy.get("#ip_r1").type("1.2.3.4");
      cy.get("#interface_r1_name").type("eth0");
      cy.get("#address_r1").type("1.2.3.5/32");
      cy.get("#vlan_id_r1").type("1");
      cy.get("#ip_r2").type("1.2.2.1");
      cy.get("#interface_r2_name").type("interface-vlan");
      cy.get("#address_r2").type("1.2.2.3/32");
      cy.get("#vlan_id_r2").type("2");
      cy.get("#service_id").type("0001");
      cy.get("#name").type("basic-service");
      cy.get("button").contains("Confirm").click();

      //assert visibility of the basic-service shape
      cy.get('[data-type="app.ServiceEntityBlock"]').should("be.visible");
      cy.get('[joint-selector="headerLabel"]').should(
        "have.text",
        "basic-service",
      );

      //deploy, assert that toast Alert appeared and that page was changed to Service Inventory view
      cy.get("button").contains("Deploy").click();

      cy.get('[data-testid="ToastAlert"]')
        .contains("Instance Composed succesfully")
        .should("be.visible");
      cy.get('[aria-label="ServiceInventory-Success"]').should("to.be.visible");
      // Check if only one row has been added to the table.
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);
    });

    it("8.2 Open existing instance in the Composer", () => {
      // Select 'test' environment
      cy.visit("/console/");
      cy.get('[aria-label="Environment card"]')
        .contains("lsm-frontend")
        .click();
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();

      // click on Show Inventory on basic-service, expect one instance alreadt
      cy.get("#basic-service", { timeout: 60000 })
        .contains("Show inventory")
        .click();
      cy.get('[aria-label="ServiceInventory-Success"]').should("to.be.visible");
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);

      // click on add instance
      cy.get("#add-instance-button").click();

      // Create instance on basic-service
      cy.get("#ip_r1").type("1.2.3.4");
      cy.get("#interface_r1_name").type("eth0");
      cy.get("#address_r1").type("1.2.3.5/32");
      cy.get("#vlan_id_r1").type("1");
      cy.get("#ip_r2").type("1.2.2.1");
      cy.get("#interface_r2_name").type("interface-vlan");
      cy.get("#address_r2").type("1.2.2.3/32");
      cy.get("#vlan_id_r2").type("2");
      cy.get("#service_id").type("0002");
      cy.get("#name").type("basic-service0002");
      cy.get("button").contains("Confirm").click();

      // expect newly created instance to be visible in table
      cy.get('[aria-label="ServiceInventory-Success"]', {
        timeout: 20000,
      }).should("to.be.visible");

      // Check if only one row has been added to the table.
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 2);
      // awiat until all instances are being deployed and up
      cy.get(".pf-v5-c-chart").within(() => {
        cy.get("#legend-labels-2", { timeout: 90000 }).should(
          "contain",
          "success: 2",
        );
      });

      // click on kebab menu on basic-service
      cy.get('[aria-label="row actions toggle"]').eq(0).click();
      cy.get("button").contains("Edit in Composer").click();

      // Expect to be redirected to Instance Composer view with basic-service shape visible
      cy.get(".canvas").should("be.visible");
      cy.get('[data-type="app.ServiceEntityBlock"]').should("be.visible");
      cy.get('[joint-selector="headerLabel"]').should(
        "have.text",
        "basic-service",
      );
    });
  });
}
