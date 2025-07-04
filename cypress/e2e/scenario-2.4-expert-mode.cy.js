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
    cy.wait("@IsCompiling").then((req) => {
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
        "/lsm/v1/service_inventory/basic-service?include_deployment_progress=True&limit=20&&sort=created_at.desc"
      ).as("GetServiceInventory");

      cy.get('[aria-label="Select-environment-test"]').click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
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

      cy.get('[aria-label="Instance-Details-Success"]', {
        timeout: 20000,
      }).should("to.be.visible");

      // Go to the settings, then to the configuration tab
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Settings").click();

      cy.get("button").contains("Configuration").click();

      // Change enable_lsm_expert_mode
      cy.get('[aria-label="Row-enable_lsm_expert_mode"]').find(".pf-v6-c-switch").click();
      cy.get('[data-testid="Warning"]').should("exist");
      cy.get('[aria-label="Row-enable_lsm_expert_mode"]').find('[aria-label="SaveAction"]').click();
      cy.get('[data-testid="Warning"]').should("not.exist");
      cy.get("[id='expert-mode-banner']")
        .should("exist")
        .and("contain", "LSM expert mode is enabled, proceed with caution.");

      // Go back to service inventory
      cy.visit("/console/");
      cy.get('[aria-label="Select-environment-test"]').click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#basic-service").contains("Show inventory").click();

      // Go to the instance details
      cy.get('[aria-label="instance-details-link"]', { timeout: 20000 }).first().click();

      // expect to find in the history the up state as last
      cy.get('[aria-label="History-Row"]', { timeout: 90000 }).should(($rows) => {
        expect($rows[0]).to.contain("up");
        expect($rows[0]).to.contain(3);
        expect($rows).to.have.length(3);
      });

      // force state to creating
      cy.get('[aria-label="Expert-Actions-Toggle"]').click();
      cy.get('[role="menuitem"]').contains("creating").click();

      // add an operation to the force state action
      cy.get("#operation-select").select("clear candidate");
      cy.get("button").contains("Yes").click();

      // expect to find in the history the creating state after the up state
      cy.get('[data-testid="version-3-state"]').should("have.text", "up");
      cy.get('[data-testid="version-4-state"]', { timeout: 60000 }).should("have.text", "creating");
    });

    it("2.4.2 Verify markdown preview in documentation tab", () => {
      cy.visit("/console/");
      cy.get('[aria-label="Select-environment-test"]').click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#basic-service").contains("Show inventory").click();

      // Go to the instance details
      cy.get('[aria-label="instance-details-link"]', { timeout: 20000 }).first().click();

      // Go to the documentation tab
      cy.get('[aria-label="documentation-content"]').click();

      // Verify the preview button exists and is clickable
      cy.get('[aria-label="preview-button"]')
        .should("exist")
        .and("be.visible")
        .and("be.enabled")
        .click();

      // Verify the preview view is shown
      cy.get('[aria-label="Markdown-Previewer-Success"]').should("exist").and("be.visible");

      // Edit the markdown text
      cy.get(".monaco-editor")
        .click()
        .focused()
        .type("{ctrl+a}{backspace}") // Clear existing content
        .type("# Test Heading\n\nThis is a test paragraph with **bold** text.");

      // Verify the preview updates with the new content
      cy.get(".markdown-body")
        .should("contain", "Test Heading")
        .and("contain", "This is a test paragraph")
        .and("contain", "bold");
    });

    it("2.4.3 Edit instance attributes", () => {
      cy.visit("/console/");
      cy.get('[aria-label="Select-environment-test"]').click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();

      // Expect to find one badge on the basic-service row.
      cy.get("#basic-service")
        .get('[aria-label="Number of instances by label"]')
        .children()
        .should("have.length", 1);
      cy.get("#basic-service").contains("Show inventory").click();

      // Go to the instance details
      cy.get('[aria-label="instance-details-link"]', { timeout: 20000 }).last().click();

      // Go to the attributes tab and select the JSON view
      cy.get('[aria-label="attributes-content"]').click();
      cy.get("#JSON").click();

      cy.get(".monaco-editor", { timeout: 15000 }).should("be.visible"); // assure the editor is loaded before further assertions.

      // edit the first line to make editor invalid (Delete the first character of the name property)
      cy.get(".mtk20").contains("name").type("{ctrl+rightArrow}{backspace}");

      // expect the Force Update to be disabled
      cy.get('[aria-label="Expert-Submit-Button"]').should("be.disabled");

      // Adjust the name property of the instance and make editor valid again
      cy.get(".mtk20").contains("nam").type("{ctrl+rightArrow}e");

      cy.wait(1000);

      // edit the value of the interface_r1_name by removing a character
      cy.get(".monaco-editor").click().focused().type("{ctrl+f}"); // open search tool

      cy.wait(1000); // let the editor settle to avoid typing text to fail

      // search for eth0
      cy.get('[aria-label="Find"]').type("eth0");

      // toggle replace option
      cy.get('[aria-label="Toggle Replace"]').click();
      // go to the replace field
      cy.get('[aria-label="Replace"]').type("eth1{enter}{enter}");

      // confirm edit
      cy.get('[aria-label="Expert-Submit-Button"]').click();
      cy.get("button").contains("Yes").click();

      // select attributes tab
      cy.get('[aria-label="attributes-content"]').click();
      cy.get("#Table").click();

      // expect the value of the interface_r1_name to be updated
      cy.get('[aria-label="interface_r1_name_value"]').should("have.text", "eth1");
    });

    it("2.4.4 Destroy previously created instance", () => {
      cy.visit("/console/");
      cy.get('[aria-label="Select-environment-test"]').click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();

      // Expect to find one badge on the basic-service row.
      cy.get("#basic-service")
        .get('[aria-label="Number of instances by label"]')
        .children()
        .should("have.length", 1);
      cy.get("#basic-service").contains("Show inventory").click();

      // Go to the instance details
      cy.get('[aria-label="instance-details-link"]', { timeout: 20000 }).first().click();

      // Open Expert menu
      cy.get('[aria-label="Expert-Actions-Toggle"]').click();
      cy.get('[role="menuitem"]').contains("Destroy").click();

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
