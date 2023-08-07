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
    cy.wait("@IsCompiling", { timeout: 10000 }).then((req) => {
      statusCodeCompile = req.response.statusCode;

      if (statusCodeCompile === 200) {
        checkStatusCompile(id);
      }
    });
  }
};

/**
 * Will by default execute the force update on the 'lsm-frontend' environment if no arguments are being passed.
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
  describe("Scenario 2.1 Service Catalog - basic-service", () => {
    before(() => {
      clearEnvironment();
      forceUpdateEnvironment();
    });

    it("2.1.1 Add Instance Cancel form", () => {
      // Go from Home page to Service Inventory of Basic-service
      cy.visit("/console/");

      cy.intercept(
        "GET",
        "/lsm/v1/service_inventory/basic-service?include_deployment_progress=True&limit=20&&sort=created_at.desc",
      ).as("GetServiceInventory");

      cy.get('[aria-label="Environment card"]')
        .contains("lsm-frontend")
        .click();
      cy.get(".pf-c-nav__item").contains("Service Catalog").click();
      cy.get("#basic-service").contains("Show inventory").click();

      // make sure the call to get inventory has been executed
      cy.wait("@GetServiceInventory");
      cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");

      // Add an instance and fill form
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
      cy.get("button").contains("Cancel").click();

      // make sure the call to get inventory has been executed
      cy.wait("@GetServiceInventory");

      // check if the view is still empty, also means we have been redirected as expected.
      cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");
    });

    it("2.1.2 Add Instance Submit form, INVALID form, EDIT form, VALID form", () => {
      // Go from Home page to Service Inventory of Basic-service
      cy.visit("/console/");
      cy.get('[aria-label="Environment card"]')
        .contains("lsm-frontend")
        .click();
      cy.get(".pf-c-nav__item").contains("Service Catalog").click();
      cy.get("#basic-service").contains("Show inventory").click();
      cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");

      // Add an instance and fill form
      cy.get("#add-instance-button").click();
      cy.get("#ip_r1").type("1.2.3.4");
      cy.get("#interface_r1_name").type("eth0");
      cy.get("#address_r1").type("1.2.3.5/32");
      cy.get("#vlan_id_r1").type("1");

      // This is an incorrect value for ip_r2
      cy.get("#ip_r2").type("1.2.2.1/32");
      cy.get("#interface_r2_name").type("interface-vlan");
      cy.get("#address_r2").type("1.2.2.3/32");
      cy.get("#vlan_id_r2").type("2");
      cy.get("#service_id").type("0001");
      cy.get("#name").type("basic-service");
      cy.get("button").contains("Confirm").click();

      // expect an error toast
      cy.get(".pf-m-danger").should("be.visible");

      // fix input that has a wrong value and submit
      cy.get("#ip_r2").clear().type("1.2.2.1");
      cy.get("button").contains("Confirm").click();

      // Should show the chart
      cy.get(".pf-v5-c-chart").should("be.visible");

      // Should show the ServiceInventory-Success Component.
      cy.get('[aria-label="ServiceInventory-Success"]').should("to.be.visible");
      // Check if only one row has been added to the table.
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);
    });

    it("2.1.3 Edit previously created instance", () => {
      cy.visit("/console/");
      cy.get('[aria-label="Environment card"]')
        .contains("lsm-frontend")
        .click();
      cy.get(".pf-c-nav__item").contains("Service Catalog").click();
      // Expect to find one badge on the basic-service row.
      cy.get("#basic-service")
        .get('[aria-label="Number of instances by label"]')
        .children()
        .should("have.length", 1);
      cy.get("#basic-service").contains("Show inventory").click();
      cy.get("#expand-toggle0").click();

      // expect row to be expanded
      cy.get(".pf-c-table__expandable-row-content").should("to.be.visible");

      // Expect to find status tab
      cy.get(".pf-c-tabs__list li:first").should("have.class", "pf-m-current");

      // check state is up now
      cy.get('[aria-label="InstanceRow-Intro"]:first')
        .find('[data-label="State"]', { timeout: 60000 })
        .should("contain", "up");

      cy.get('[aria-label="LegendItem-deployed"]').should("contain", "1");

      // click on edit button
      cy.get(".pf-c-description-list__group")
        .find("button")
        .eq(2)
        .last()
        .click();

      // check if amount of fields is lesser than create amount.
      cy.get("form").find("input").should("have.length.of.at.most", 11);

      // delete first value and submit should give an error toast
      cy.get("#address_r1").clear();
      cy.get("button").contains("Confirm").click();
      cy.get(".pf-m-danger").should("be.visible");

      // Fill in first value 1.2.3.8/32 and submit
      cy.get("#address_r1").type("1.2.3.8/32");
      cy.get("button").contains("Confirm").click();

      // expect to land on Service Inventory page and to find attributes tab button
      cy.get(".pf-c-tabs__list")
        .contains("Attributes", { timeout: 20000 })
        .click();

      // Expect to find new value as candidate and old value in active and no rollback value
      cy.get('[aria-label="Row-address_r1"')
        .find('[data-label="candidate"]', { timeout: 20000 })
        .should("contain", "1.2.3.8/32");
      cy.get('[aria-label="Row-address_r1"')
        .find('[data-label="active"]')
        .should("contain", "1.2.3.5/32");
      cy.get('[aria-label="Row-address_r1"')
        .find('[data-label="rollback"]')
        .should("contain", "");
    });

    it("2.1.4 Delete previously created instance", () => {
      cy.visit("/console/");

      // Add interceptions for the delete and get call to be able to catch responses later on.
      cy.intercept("DELETE", "/lsm/v1/service_inventory/basic-service/**").as(
        "DeleteInstance",
      );
      cy.intercept(
        "GET",
        "/lsm/v1/service_inventory/basic-service?include_deployment_progress=True&limit=20&&sort=created_at.desc",
      ).as("GetServiceInventory");

      cy.get('[aria-label="Environment card"]')
        .contains("lsm-frontend")
        .click();

      // START WORKAROUND

      // TODO: Remove workaround for race condition.
      // Must be done after https://github.com/inmanta/inmanta-lsm/issues/1249
      // Linked to: https://github.com/orgs/inmanta/projects/1?pane=issue&itemId=25836961
      cy.get(".pf-c-nav__link").contains("Compile Reports").click();
      cy.get("button", { timeout: 60000 }).contains("Recompile").click();

      // END WORKAROUND.

      cy.get(".pf-c-nav__item").contains("Service Catalog").click();
      cy.get("#basic-service").contains("Show inventory").click();

      //check for instance state to change to up
      cy.get('[data-label="State"]')
        .find(".pf-c-label.pf-m-green", { timeout: 60000 })
        .should("contain", "up");

      // expand first row
      cy.get("#expand-toggle0", { timeout: 20000 }).click();

      // delete but cancel deletion in modal
      cy.get(".pf-c-description-list", { timeout: 60000 })
        .find("button")
        .contains("Delete")
        .click();
      cy.get(".pf-c-modal-box__title-text").should(
        "contain",
        "Delete instance",
      );
      cy.get(".pf-c-form__actions").contains("No").click();

      cy.get(".pf-c-description-list", { timeout: 60000 })
        .find("button")
        .contains("Delete")
        .click();
      cy.get(".pf-c-modal-box__title-text").should(
        "contain",
        "Delete instance",
      );
      cy.get(".pf-c-form__actions").contains("Yes").click();

      // check response if instance has been deleted successfully.
      cy.wait("@DeleteInstance").its("response.statusCode").should("eq", 200);
    });
  });
}
