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

describe("Scenario 3 - Service Details", () => {
  it("3.1 Check empty state", () => {
    cy.visit("/console/");
    cy.get('[aria-label="Environment card"]').contains("lsm-frontend").click();

    // Click on kebab menu and select Show Details on basic-service
    cy.get("#basic-service").find('[aria-label="Actions"]').click();
    cy.get("button").contains("Show Details").click();

    // Expect to be redirected on Service Details: basic-service
    cy.get("h1")
      .contains("Service Details: basic-service")
      .should("to.be.visible");

    // Expect  the current tab to be Details
    cy.get(".pf-m-current").should("contain", "Details");

    // Expect 0 Instances
    cy.get(".pf-c-chart").within(() => {
      cy.get("svg")
        .find("title")
        .should("contain", "Number of instances by label");
      cy.get("svg")
        .find("text")
        .should("contain", "0")
        .and("contain", "Instances");
    });

    // Go to Attributes tab
    cy.get("button").contains("Attributes").click();

    // Expect table with data
    cy.get('[aria-label="Row-address_r1"]')
      .should("contain", "address_r1")
      .and("contain", "string");
    cy.get('[aria-label="Row-address_r2"]')
      .should("contain", "address_r2")
      .and("contain", "string");
    cy.get('[aria-label="Row-default_resource"]')
      .should("contain", "default_resource")
      .and("contain", "bool");
    cy.get('[aria-label="Row-interface_r1_name"]')
      .should("contain", "interface_r1_name")
      .and("contain", "string");
    cy.get('[aria-label="Row-interface_r2_name"]')
      .should("contain", "interface_r2_name")
      .and("contain", "string");
    cy.get('[aria-label="Row-ip_r1"]')
      .should("contain", "ip_r1")
      .and("contain", "string");
    cy.get('[aria-label="Row-ip_r2"]')
      .should("contain", "ip_r2")
      .and("contain", "string");
    cy.get('[aria-label="Row-name"]')
      .should("contain", "name")
      .and("contain", "string");
    cy.get('[aria-label="Row-service_id"]')
      .should("contain", "service_id")
      .and("contain", "string");
    cy.get('[aria-label="Row-should_fail"]')
      .should("contain", "should_fail")
      .and("contain", "bool");
    cy.get('[aria-label="Row-vlan_id_r1"]')
      .should("contain", "vlan_id_r1")
      .and("contain", "int");
    cy.get('[aria-label="Row-vlan_id_r2"]')
      .should("contain", "vlan_id_r2")
      .and("contain", "int");

    // Go to Lifecycle states
    cy.get("button").contains("Lifecycle States").click();

    // Expect to find table with 16 different state rows.
    cy.get('[aria-label="Lifecycle"').should(($table) => {
      const $tableBody = $table.find("tbody");
      const $dataRows = $tableBody.find("tr");

      expect($dataRows).to.have.length(16);
    });

    // Go to Config tab
    cy.get("button").contains("Config").click();

    // Expect it to be an empty table
    cy.get(".pf-c-empty-state")
      .should("contain", "There is nothing here")
      .and("contain", "No settings found");

    // Go to Callback tab
    cy.get("button").contains("Callbacks").click();

    // Expect no callbacks to be configured.(When there are callbacks, a second tbody will be present.)
    cy.get('[aria-label="CallbacksTable"]').should(($table) => {
      const $tableBody = $table.find("tbody");
      expect($tableBody).to.have.length(1);
    });
  });

  it("3.2 Create success instance and check details", () => {
    // Select 'test' environment
    cy.visit("/console/");
    cy.get('[aria-label="Environment card"]').contains("lsm-frontend").click();

    // click on Show Inventory on basic-service
    cy.get("#basic-service").contains("Show inventory").click();
    cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");

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
    cy.get("#service_id").type("0001");
    cy.get("#name").type("basic-service");
    cy.get("button").contains("Confirm").click();

    // expect newly created instance to be visible in table
    cy.get('[aria-label="ServiceInventory-Success"]', {
      timeout: 20000,
    }).should("to.be.visible");

    // Check if only one row has been added to the table.
    cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);

    // go back to Service Catalog
    cy.get('[aria-label="BreadcrumbItem"]').contains("Service Catalog").click();

    // click on kebab menu on basic-service
    cy.get("#basic-service").find('[aria-label="Actions"]').click();
    cy.get("button").contains("Show Details").click();

    // Expect to be redirected on Service Details: basic-service
    cy.get("h1")
      .contains("Service Details: basic-service")
      .should("to.be.visible");

    // Click on Details tab
    cy.get("button").contains("Details").click();

    // Expect the number in the chart to be 1
    cy.get(".pf-c-chart").within(() => {
      cy.get("svg")
        .find("title")
        .should("contain", "Number of instances by label");
      cy.get("svg")
        .find("text")
        .should("contain", "1")
        .and("contain", "Instances");
    });
  });

  it("3.3 Create a failed Instance and check details", () => {
    // Select 'test' environment
    cy.visit("/console/");
    cy.get('[aria-label="Environment card"]').contains("lsm-frontend").click();

    // click on Show Inventory on basic-service
    cy.get("#basic-service").contains("Show inventory").click();

    // click on add instance
    cy.get("#add-instance-button").click();

    // Create a failed instance on basic-service
    cy.get("#ip_r1").type("1.2.3.4");
    cy.get("#interface_r1_name").type("eth1");
    cy.get("#address_r1").type("1.2.3.8/32");
    cy.get("#vlan_id_r1").type("4");
    cy.get("#ip_r2").type("1.2.2.1");
    cy.get("#interface_r2_name").type("interface-vlan2");
    cy.get("#address_r2").type("1.2.2.8/32");
    cy.get("#vlan_id_r2").type("8");
    cy.get("#service_id").type("0008");
    cy.get("#name").type("failed");
    cy.get("button").contains("Confirm").click();

    // expect newly created instance to be visible in table

    // go back to Service Catalog

    // click on kebab menu on basic-service

    // click on Show Details

    // Expect to be redirected on Service Details: basic-service

    // Expect to be on last visited tab (Details in this case)

    // Click on Details tab

    // Expect the number in the chart to be 2

    // Expect 1 success and 1 danger

    // Go back to home page
  });

  it("3.4 Callbacks", () => {
    // Select card 'test' environment on home page
    // Click on kebab menu and select Show Details on basic-service
    // Expect to be redirected on Service Details: basic-service
    // Go to the callback tab
    // Fill in the fields
    // Submit form
    // Expect an error to show up : Something went wrong
    // Change the input field for url to : http://localhost:1234
    // Expect new row to be added to the view.
    // Expect the form to be cleared completely.
    // click on expand row
    // Expect to see all values except ALLOCATION_UPDATE and API_SET_STATE_TRANSITION to have text-decoration: line-through
    // Expect the UUID to be truncated to 8 characters
    // Expect the minimal log level to be INFO and not 20 (that's the numerical code for INFO)
    // Delete Callback
    // Expect modal
    // Confirm delete
    // Expect row to be gone.
    // Go back to Home
  });

  it("3.5 Delete Service", () => {
    // Select card 'test' environment on home page
    // Click on kebab menu and select Show Details on basic-service
    // Expect to be redirected on Service Details: basic-service
    // Expect to be on Callback tab
    // Go to Detail tab
    // Click on Delete button
    // Expect modal to confirm action
    // Cancel action
    // Expect nothing to happen
    // Click again on Delete button
    // Confirm modal
    // Expect Toast : Deleting service entity failed
    // Go back to Service Catalog
    // Click on Show Invetory on basic-service
    // Click open first row
    // Click on delete instance
    // Confirm deletion
    // Open second row
    // Click on delete instance
    // Confirm deletion
    // Expect to be redirected to Service Catalog after deletion
    // Expect deleted Service to not be in the catalog anymore.
  });
});
