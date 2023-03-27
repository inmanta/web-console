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

describe("Scenario 2.4 Service Catalog - basic-service", () => {
  it("2.4.1 Force new state in the instance", () => {
    // Go from Home page to Service Inventory of Basic-service
    cy.visit("/console/");

    cy.intercept(
      "GET",
      "/lsm/v1/service_inventory/basic-service?include_deployment_progress=True&limit=20&&sort=created_at.desc"
    ).as("GetServiceInventory");

    cy.get('[aria-label="Environment card"]').contains("lsm-frontend").click();
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
    cy.get("#ip_r2").type("1.2.2.4");
    cy.get("#interface_r2_name").type("interface-vlan");
    cy.get("#address_r2").type("1.2.2.3");
    cy.get("#vlan_id_r2").type("2");
    cy.get("#service_id").type("0001");
    cy.get("#name").type("basic-service");
    cy.get("button").contains("Confirm").click();

    // make sure the call to get inventory has been executed
    cy.wait("@GetServiceInventory");

    // check if the view is still empty, also means we have been redirected as expected.
    cy.get('[aria-label="ServiceInventory-Success"]').should("to.be.visible");

    //Go to the settings, then to the configuration tab
    cy.get(".pf-c-nav__item").contains("Settings").click();
    cy.get("button").contains("Configuration").click();

    //Change enable_lsm_expert_mode
    cy.get('[aria-label="Row-enable_lsm_expert_mode"]')
      .find(".pf-c-switch")
      .click();
    cy.get('[aria-label="Warning"]').should("exist");
    cy.get('[aria-label="Row-enable_lsm_expert_mode"]')
      .find('[aria-label="SaveAction"]')
      .click();
    cy.get('[aria-label="Warning"]').should("not.exist");
    cy.get(".pf-c-banner.pf-m-danger.pf-m-sticky")
      .should("exist")
      .and("contain", "LSM expert mode is enabled, proceed with caution.");
    //go back to service inventory
    cy.visit("/console/");
    cy.get('[aria-label="Environment card"]').contains("lsm-frontend").click();
    cy.get(".pf-c-nav__item").contains("Service Catalog").click();
    cy.get("#basic-service").contains("Show inventory").click();
    cy.get("#expand-toggle0").click();

    //wait until state is up and change it to creating with help of force state functionality
    cy.get(".pf-c-description-list").contains("Edit").should("be.disabled");
    cy.get('[aria-label="InstanceRow-Intro"]:first')
      .find('[data-label="State"]', { timeout: 40000 })
      .should("contain", "up");
    cy.get(".pf-c-description-list").contains("Edit").should("not.be.disabled");

    cy.get(".pf-c-dropdown__toggle")
      .contains("Force state to")
      .click({ force: true });
    cy.get(".pf-c-dropdown__menu-item").contains("creating").click();
    // Modal title for confirmation of Destroying instance should be visible
    cy.get(".pf-c-modal-box__title-text")
      .contains("Confirm force state transfer")
      .should("be.visible");

    //Cancel modal and expect nothing to change
    cy.get("button").contains("No").click();
    cy.get('[aria-label="InstanceRow-Intro"]:first')
      .find('[data-label="State"]')
      .should("contain", "up");

    //push new state, confirm modal and expect new value in the State data cell
    cy.get(".pf-c-dropdown__toggle")
      .contains("Force state to")
      .click({ force: true });
    cy.get(".pf-c-dropdown__menu-item").contains("creating").click();
    cy.get("button").contains("Yes").click();
    cy.get('[aria-label="InstanceRow-Intro"]:first')
      .find('[data-label="State"]')
      .should("contain", "creating", { timeout: 20000 });
  });

  it("2.4.2 Edit instance attributes", () => {
    cy.visit("/console/");
    cy.get('[aria-label="Environment card"]').contains("lsm-frontend").click();
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
    // Expect edit button to be disabled after previous state change
    cy.get(".pf-c-description-list").contains("Edit").should("be.disabled");
    // expect to land on Service Inventory page and to find attributes tab button
    cy.get(".pf-c-tabs__list")
      .contains("Attributes", { timeout: 20000 })
      .click();

    // Find and check initial values for targetted attribute address_r1
    cy.get('[aria-label="Row-address_r1"')
      .find('[data-label="active"]', { timeout: 20000 })
      .should("contain", "1.2.3.5/32");
    cy.get('[aria-label="Row-address_r1"')
      .find('[data-label="active"]')
      .find("button")
      .click();
    //type invalid value and submit
    cy.get('[aria-label="new-attribute-input"]').type(
      "{selectall}{backspace}invalid"
    );
    cy.get('[data-testid="inline-submit"]').click();
    //expect dialog to pop-up, and after canceling it won't affect input state
    cy.get(".pf-c-modal-box__title-text")
      .contains("Update Attribute")
      .should("be.visible");
    cy.get('[data-testid="dialog-cancel"]').click();
    cy.get('[aria-label="new-attribute-input"]', { timeout: 20000 }).should(
      "have.value",
      "invalid"
    );
    // send invalid value and expect toast alert with error message
    cy.get('[data-testid="inline-submit"]').click();
    cy.get('[data-testid="dialog-submit"]').click();
    cy.get('[aria-label="ToastAlert"]')
      .contains("Setting new attribute failed")
      .should("be.visible");
    cy.get(
      '[aria-label="Close Danger alert: alert: Setting new attribute failed"]'
    ).click();
    //pass valid value then submit and expect new value to be pushed to the cell
    cy.get('[aria-label="new-attribute-input"]').type(
      "{selectall}{backspace}1.2.3.8/32"
    );
    cy.get('[data-testid="inline-submit"]').click();
    cy.get('[data-testid="dialog-submit"]').click();
    cy.get('[aria-label="Row-address_r1"')
      .find('[data-label="active"]', { timeout: 20000 })
      .should("contain", "1.2.3.8/32");

    //interface_r1_name
    cy.get('[aria-label="Row-interface_r1_name"')
      .find('[data-label="active"]')
      .should("contain", "eth0");
    cy.get('[aria-label="Row-interface_r1_name"')
      .find('[data-label="active"]')
      .find("button")
      .click();
    //type invalid value and submit
    cy.get('[aria-label="new-attribute-input"]').type(
      "{selectall}{backspace}eth1"
    );
    cy.get('[data-testid="inline-submit"]').click();
    //expect dialog to pop-up, and after submiting xpect new value to be pushed to the cell
    cy.get('[data-testid="dialog-submit"]').click();
    cy.get('[aria-label="Row-interface_r1_name"')
      .find('[data-label="active"]', { timeout: 20000 })
      .should("contain", "eth1");

    //should_deploy_fail
    cy.get('[aria-label="Row-should_deploy_fail"')
      .find('[data-label="active"]')
      .should("contain", "false");

    cy.get('[aria-label="Row-should_deploy_fail"')
      .find('[data-label="active"]')
      .find("button")
      .click();
    cy.get(".pf-c-switch__toggle").click();
    cy.get('[data-testid="inline-submit"]').click();
    cy.get('[data-testid="dialog-submit"]').click();

    cy.get('[aria-label="Row-should_deploy_fail"')
      .find('[data-label="active"]')
      .should("contain", "true");

    //vlan_id_r1
    cy.get('[aria-label="Row-vlan_id_r1"')
      .find('[data-label="active"]')
      .should("contain", "1");
    cy.get('[aria-label="Row-vlan_id_r1"')
      .find('[data-label="active"]')
      .find("button")
      .click();
    //type invalid value and submit
    cy.get('[aria-label="new-attribute-input"]').type(
      "{selectall}{backspace}5"
    );
    cy.get('[data-testid="inline-submit"]').click();
    //expect dialog to pop-up, and after submiting xpect new value to be pushed to the cell
    cy.get('[data-testid="dialog-submit"]').click();
    cy.get('[aria-label="Row-vlan_id_r1"')
      .find('[data-label="active"]')
      .should("contain", "5");
  });
  it("2.4.3 Destroy previously created instance", () => {
    cy.visit("/console/");
    cy.get('[aria-label="Environment card"]').contains("lsm-frontend").click();
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

    // Click on destroy button
    cy.get(".pf-c-description-list").contains("Destroy").click();

    // Modal title for confirmation of Destroying instance should be visible
    cy.get(".pf-c-modal-box__title-text")
      .contains("Destroy instance")
      .should("be.visible");

    //Confirm modal and expect to new view almost appear informing that there is no instances of that service found
    cy.get("button").contains("Yes").click();
    cy.get('[aria-label="ServiceInventory-Empty"').should("to.be.visible");

    //at the end go back to settings and turn expert mode off
    cy.get(".pf-c-nav__item").contains("Settings").click();
    cy.get("button").contains("Configuration").click();
    cy.get('[aria-label="Row-enable_lsm_expert_mode"]')
      .find(".pf-c-switch")
      .click();
    cy.get('[aria-label="Warning"]').should("exist");
    cy.get('[aria-label="Row-enable_lsm_expert_mode"]')
      .find('[aria-label="SaveAction"]')
      .click();
    cy.get('[aria-label="Warning"]').should("not.exist");
    cy.get(".pf-c-banner.pf-m-danger.pf-m-sticky").should("not.exist");
  });
});
