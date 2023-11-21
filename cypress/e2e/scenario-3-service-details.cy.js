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
  describe("Scenario 3 - Service Details", () => {
    before(() => {
      clearEnvironment();
      forceUpdateEnvironment();
    });

    it("3.1 Check empty state", () => {
      cy.visit("/console/");
      cy.get('[aria-label="Environment card"]')
        .contains("lsm-frontend")
        .click();
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();

      // Click on kebab menu and select Show Details on basic-service
      cy.get("#basic-service", { timeout: 60000 })
        .find('[aria-label="Actions"]')
        .click();
      cy.get("button").contains("Show Details").click();

      // Expect to be redirected on Service Details: basic-service
      cy.get("h1")
        .contains("Service Details: basic-service")
        .should("to.exist");

      // Expect  the current tab to be Details
      cy.get(".pf-m-current").should("contain", "Details");

      // Expect 0 Instances
      cy.get(".pf-v5-c-chart").within(() => {
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
      cy.get('[aria-label="Row-should_deploy_fail"]')
        .should("contain", "should_deploy_fail")
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
      cy.get(".pf-v5-c-empty-state")
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
      cy.get('[aria-label="BreadcrumbItem"]')
        .contains("Service Catalog")
        .click();

      // click on kebab menu on basic-service
      cy.get("#basic-service", { timeout: 60000 })
        .find('[aria-label="Actions"]')
        .click();
      cy.get("button").contains("Show Details").click();

      // Expect to be redirected on Service Details: basic-service
      cy.get("h1", { timeout: 20000 })
        .contains("Service Details: basic-service")
        .should("to.exist");

      // Click on Details tab
      cy.get("button").contains("Details").click();

      // Expect the number in the chart to be 1
      cy.get(".pf-v5-c-chart").within(() => {
        cy.get("svg")
          .find("title")
          .should("contain", "Number of instances by label");
        cy.get("svg")
          .find("text")
          .should("contain", "1")
          .and("contain", "Instances");
      });
    });

    it("3.3 Create a failed Instance by Duplicating and check details", () => {
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

      // click on duplicate instance
      cy.get('[aria-label="row actions toggle"]', { timeout: 60000 })
        .eq(0)
        .click();
      cy.get(".pf-v5-c-menu__item").contains("Duplicate").click();

      // Create a failed instance on basic-service
      cy.get("#service_id").type("0008");
      cy.get("#name").clear();
      cy.get("#name").type("failed");
      cy.get(".pf-v5-c-switch").first().click();
      cy.get("button").contains("Confirm").click();

      // Expect the number in the chart to be 2
      cy.get(".pf-v5-c-chart").within(() => {
        cy.get("svg")
          .find("title")
          .should("contain", "Number of instances by label");
        cy.get("svg")
          .find("text")
          .should("contain", "2")
          .and("contain", "Instances");
      });

      // expect newly created instance to be visible in table
      cy.get('[aria-label="ServiceInventory-Success"]', {
        timeout: 20000,
      }).should("to.be.visible");

      // Check if only one row has been added to the table.
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 2);

      // Check if the newly added instance has failed.
      cy.get('[aria-label="InstanceRow-Intro"]')
        .first()
        .should(($row) => {
          const $cols = $row.find("td");
          expect($cols.eq(1), "name").to.have.text("failed");
        });

      // long timeout justified by the fact that a few compiles are already queued at this point and status change will only be changed after.
      cy.get(".pf-v5-c-label.pf-m-red", { timeout: 120000 }).should(
        "contain",
        "failed",
      );

      // go back to Service Catalog
      cy.get('[aria-label="BreadcrumbItem"]')
        .contains("Service Catalog")
        .click();

      // click on kebab menu on basic-service
      cy.get("#basic-service", { timeout: 60000 })
        .find('[aria-label="Actions"]')
        .click();
      cy.get("button").contains("Show Details").click();

      // Expect to be redirected on Service Details: basic-service
      cy.get("h1")
        .contains("Service Details: basic-service")
        .should("to.exist");

      // Expect to be Details tab
      cy.get(".pf-m-current").should("contain", "Details");

      // Expect the number in the chart to be 2
      cy.get(".pf-v5-c-chart").within(() => {
        cy.get("svg")
          .find("title")
          .should("contain", "Number of instances by label");
        cy.get("svg")
          .find("text")
          .should("contain", "2")
          .and("contain", "Instances");
      });
    });

    it("3.4 Callbacks", () => {
      // Select card 'test' environment on home page
      cy.visit("/console/");
      cy.get('[aria-label="Environment card"]')
        .contains("lsm-frontend")
        .click();
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();

      // Click on kebab menu and select Show Details on basic-service
      cy.get("#basic-service", { timeout: 60000 })
        .find('[aria-label="Actions"]')
        .click();
      cy.get("button").contains("Show Details").click();

      // Expect to be redirected on Service Details: basic-service
      cy.get("h1", { timeout: 20000 })
        .contains("Service Details: basic-service")
        .should("to.exist");

      // Go to the callback tab
      cy.get("button").contains("Callbacks").click();

      // Fill in the fields
      cy.get('[aria-label="callbackUrl"]').type("wrongUrl");
      cy.get('[aria-label="callbackId"]').type(
        "60b18097-1525-47f2-95ae-1d941d9c0c85",
      );
      cy.get('[aria-label="MinimalLogLevelFilterInput"]').click();
      cy.get('[role="option"]').contains("INFO").click();
      cy.get('[aria-label="EventTypesFilterInput"]').click();
      cy.get('[role="option"]').contains("ALLOCATION_UPDATE").click();
      cy.get("button").contains("Add").click();

      // Expect an error to show up : Something went wrong
      cy.get('[data-testid="Alert Danger"]').should("to.be.visible");

      // Change the input field for url to : http://localhost:1234
      cy.get('[aria-label="callbackUrl"]').clear();
      cy.get('[aria-label="callbackUrl"]').type("http://localhost:1234");
      cy.get("button").contains("Add").click();

      // Expect new row to be added to the view.
      cy.get('[aria-label="CallbacksTable"]').should(($table) => {
        const $tableBody = $table.find("tbody");
        expect($tableBody).to.have.length(2);
      });

      // Expect the form to be cleared completely.
      cy.get('[aria-label="callbackUrl"]').should("have.value", "");
      cy.get('[aria-label="callbackId"]').should("have.value", "");

      // click on expand row
      cy.get("button").contains("http://localhost:1234").click();

      // Expect to see all values except ALLOCATION_UPDATE to have text-decoration: line-through
      cy.get(".pf-v5-c-description-list__description ul").should(($ul) => {
        const $list = $ul.find("li");
        expect($list).to.have.length(10);
      });

      cy.get(".pf-v5-c-description-list__description li")
        .first()
        .should("have.css", "text-decoration")
        .and("contain", "none solid");
      cy.get(".pf-v5-c-description-list__description li")
        .eq(1)
        .should("have.css", "text-decoration")
        .and("contain", "line-through solid");
      cy.get(".pf-v5-c-description-list__description li")
        .eq(2)
        .should("have.css", "text-decoration")
        .and("contain", "line-through solid");
      cy.get(".pf-v5-c-description-list__description li")
        .eq(3)
        .should("have.css", "text-decoration")
        .and("contain", "line-through solid");
      cy.get(".pf-v5-c-description-list__description li")
        .eq(4)
        .should("have.css", "text-decoration")
        .and("contain", "line-through solid");
      cy.get(".pf-v5-c-description-list__description li")
        .eq(5)
        .should("have.css", "text-decoration")
        .and("contain", "line-through solid");
      cy.get(".pf-v5-c-description-list__description li")
        .eq(6)
        .should("have.css", "text-decoration")
        .and("contain", "line-through solid");
      cy.get(".pf-v5-c-description-list__description li")
        .eq(7)
        .should("have.css", "text-decoration")
        .and("contain", "line-through solid");

      // Expect the UUID to be truncated to 8 characters, have INFO level and 1 Event Type.
      cy.get('[aria-label="CallbacksTable"]').should(($table) => {
        const $tableBody = $table.find("tbody").eq(1);
        const $cells = $tableBody.find("td");

        expect($cells.eq(1), "Id").to.have.text("60b18097");
        expect($cells.eq(2), "Minimal Log Level").to.have.text("INFO");
        expect($cells.eq(3), "Event Types").to.have.text("1 Event Types");
      });

      // Delete Callback
      cy.get("button").contains("Delete", { timeout: 20000 }).click();

      // Confirm deletion
      cy.get("#submit").click();

      // Expect row to be gone. So there should only be one tbody left.
      cy.get('[aria-label="CallbacksTable"]').should(($table) => {
        const $tableBody = $table.find("tbody");
        expect($tableBody).to.have.length(1);
      });
    });

    it("3.5 Delete Service", () => {
      // Select card 'test' environment on home page
      cy.visit("/console/");
      cy.get('[aria-label="Environment card"]')
        .contains("lsm-frontend")
        .click();
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();

      // Click on Delete button
      cy.get("#basic-service", { timeout: 60000 })
        .find('[aria-label="Actions"]')
        .click();
      cy.get("button", { timeout: 30000 }).contains("Delete").click();

      // Expect modal to confirm action and cancel it
      cy.get("#cancel").click();

      // Click again on Delete button
      cy.get("#basic-service", { timeout: 60000 })
        .find('[aria-label="Actions"]')
        .click();
      cy.get("button", { timeout: 20000 }).contains("Delete").click();

      // Confirm modal
      cy.get("#submit").click();

      // Expect Toast : Deleting service entity failed
      cy.get('[data-testid="ToastAlert"]').should("to.be.visible");

      // Click on Show Invetory on basic-service
      cy.get("#basic-service", { timeout: 60000 })
        .contains("Show inventory")
        .click();

      // Click on delete instance first row
      cy.get('[aria-label="row actions toggle"]', { timeout: 60000 })
        .eq(0)
        .click();
      cy.get(".pf-v5-c-menu__item").contains("More actions").click();
      cy.get(".pf-v5-c-menu__item").contains("Delete").click();

      // Confirm deletion
      cy.get("#submit").click();

      // Click on delete instance second row
      cy.get('[aria-label="row actions toggle"]', { timeout: 60000 })
        .eq(1)
        .click();
      cy.get(".pf-v5-c-menu__item").contains("More actions").click();
      cy.get(".pf-v5-c-menu__item").contains("Delete").click();

      // Confirm deletion
      cy.get("#submit", { timeout: 20000 }).click();

      // Expect to be redirected to Service Catalog after deletion
      cy.get('[aria-label="ServiceInventory-Empty"]', {
        timeout: 120000,
      }).should("to.be.visible");
    });
  });
}
