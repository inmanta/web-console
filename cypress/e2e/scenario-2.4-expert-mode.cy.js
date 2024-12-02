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

if (Cypress.env("edition") === "iso") {
  describe("Scenario 2.4 Service Catalog - basic-service", () => {
    before(() => {
      clearEnvironment();
      forceUpdateEnvironment();
    });

    it("2.4.1 Force new state in the instance", () => {
      // Go from Home page to Service Inventory of Basic-service
      cy.visit("/console/");

      cy.intercept(
        "GET",
        "/lsm/v1/service_inventory/basic-service?include_deployment_progress=True&limit=20&&sort=created_at.desc",
      ).as("GetServiceInventory");

      cy.get('[aria-label="Environment card"]')
        .contains("lsm-frontend")
        .click();
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();
      cy.get("#basic-service").contains("Show inventory").click();

      // Make sure the call to get inventory has been executed
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

      // Make sure the call to get inventory has been executed
      cy.wait("@GetServiceInventory");

      // Check if the view is still empty, also means we have been redirected as expected.
      cy.get('[aria-label="ServiceInventory-Success"]').should("to.be.visible");

      // Go to the settings, then to the configuration tab
      cy.get(".pf-v5-c-nav__item").contains("Settings").click();
      cy.get("button").contains("Configuration").click();

      // Change enable_lsm_expert_mode
      cy.get('[aria-label="Row-enable_lsm_expert_mode"]')
        .find(".pf-v5-c-switch")
        .click();
      cy.get('[data-testid="Warning"]').should("exist");
      cy.get('[aria-label="Row-enable_lsm_expert_mode"]')
        .find('[aria-label="SaveAction"]')
        .click();
      cy.get('[data-testid="Warning"]').should("not.exist");
      cy.get("[id='expert-mode-banner']")
        .should("exist")
        .and("contain", "LSM expert mode is enabled, proceed with caution.");

      // Go back to service inventory
      cy.visit("/console/");
      cy.get('[aria-label="Environment card"]')
        .contains("lsm-frontend")
        .click();
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();
      cy.get("#basic-service").contains("Show inventory").click();

      // Go to the instance details
      cy.get('[aria-label="row actions toggle"]').click();
      cy.get(".pf-v5-c-menu__item")
        .first()
        .contains("Instance Details")
        .click();

      // expect to find in the history the up state as last
      cy.get('[aria-label="History-Row"]', { timeout: 60000 }).should(
        ($rows) => {
          expect($rows[0]).to.contain("up");
          expect($rows[0]).to.contain(3);
          expect($rows).to.have.length(3);
        },
      );

      // force state to creating
      cy.get('[aria-label="Expert-Actions-Toggle"]').click();
      cy.get("button").contains("creating").click();

      // add an operation to the force state action
      cy.get("#operation-select").select("clear candidate");
      cy.get("button").contains("Yes").click();

      // expect to find in the history the creating state as last
      cy.get('[aria-label="History-Row"]', { timeout: 30000 }).should(
        ($rows) => {
          expect($rows[0]).to.contain("creating");
          expect($rows[0]).to.contain(4);
          expect($rows).to.have.length(4);
        },
      );
    });

    it("2.4.2 Edit instance attributes", () => {
      cy.visit("/console/");
      cy.get('[aria-label="Environment card"]')
        .contains("lsm-frontend")
        .click();
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();

      // Expect to find one badge on the basic-service row.
      cy.get("#basic-service")
        .get('[aria-label="Number of instances by label"]')
        .children()
        .should("have.length", 1);
      cy.get("#basic-service").contains("Show inventory").click();

      // Go to the instance details
      cy.get('[aria-label="row actions toggle"]').click();
      cy.get(".pf-v5-c-menu__item")
        .first()
        .contains("Instance Details")
        .click();

      // Go to the attributes tab and select the JSON view
      cy.get('[aria-label="attributes-content"]').click();
      cy.get("#JSON").click();

      // edit the first line to make editor invalid (Delete the first character of the name property)
      cy.get(".mtk20").contains("name").type("{home}{rightArrow}{del}");

      // expect the Force Update to be disabled
      cy.get("button").contains("Force Update").should("be.disabled");

      // Adjust the name property of the instance and make editor valid again
      cy.get(".mtk20").contains("ame").type("{home}{rightArrow}n");

      // edit the value of the name by removing characters
      cy.get(".mtk5")
        .contains("basic-service")
        .type(
          "{end}{leftArrow}{leftArrow}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}",
        );

      // confirm edit
      cy.get("button").contains("Force Update").click();
      cy.get("button").contains("Yes").click();

      // Go back to inventory using the breadcrumbs
      cy.get('[aria-label="BreadcrumbItem"]')
        .contains("Service Inventory: basic-service")
        .click();

      // Expect the name of the instance to be updated in the inventory
      // (Until the BE fixes the history logs not being updated when force updating attributes)
      cy.get('[aria-label="IdentityCell-basic"]').should("be.visible");
    });

    it("2.4.3 Destroy previously created instance", () => {
      cy.visit("/console/");
      cy.get('[aria-label="Environment card"]')
        .contains("lsm-frontend")
        .click();
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();

      // Expect to find one badge on the basic-service row.
      cy.get("#basic-service")
        .get('[aria-label="Number of instances by label"]')
        .children()
        .should("have.length", 1);
      cy.get("#basic-service").contains("Show inventory").click();

      // Go to the instance details
      cy.get('[aria-label="row actions toggle"]').click();
      cy.get(".pf-v5-c-menu__item")
        .first()
        .contains("Instance Details")
        .click();

      // Open Expert menu
      cy.get('[aria-label="Expert-Actions-Toggle"]').click();
      cy.get(".pf-v5-c-menu__item").contains("Destroy").click();

      // confirm action
      cy.get("button").contains("Yes").click();

      // expect to be redirected on the inventory page, and table to be empty
      cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");

      // At the end turn expert mode off through the banner
      cy.get("button").contains("Disable").click();
      cy.get('[data-testid="Warning"]').should("not.exist");
      cy.get("[id='expert-mode-banner']").should("not.exist");
    });
  });
}
