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
const forceUpdateEnvironment = (nameEnvironment = "test") => {
  cy.visit("/console/");
  cy.get(`[aria-label="Select-environment-${nameEnvironment}"]`).click();
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

const isIso = Cypress.env("edition") === "iso";

describe("Scenario 6 : Resources", () => {
  if (isIso) {
    before(() => {
      clearEnvironment();
      forceUpdateEnvironment();
    });
  }

  it("6.1 Initial state", () => {
    // Select Test environment
    cy.visit("/console/");

    cy.get(`[aria-label="Select-environment-test"]`).click();

    // Go to Resources page by clicking on navbar
    cy.get('[aria-label="Sidebar-Navigation-Item"]')
      .contains("Resources")
      .click();

    // Expect 0/0 resources to be visible
    cy.get('[aria-label="Deployment state summary"]').should(
      "contain",
      isIso ? "0 / 0" : "5 / 5",
    );
    // Expect table to be empty in case of ISO project
    isIso &&
      cy.get('[aria-label="ResourcesView-Empty"]').should("to.be.visible");
  });

  if (isIso) {
    it("6.2 Add instance on a basic-service", () => {
      // Select Test environment
      cy.visit("/console/");

      cy.get(`[aria-label="Select-environment-test"]`).click();

      // Go to Service Catalog
      cy.get('[aria-label="Sidebar-Navigation-Item"]')
        .contains("Service Catalog")
        .click();

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

      cy.get('[aria-label="Instance-Details-Success"]', {
        timeout: 20000,
      }).should("to.be.visible");

      // Go back to Resources page
      cy.get('[aria-label="Sidebar-Navigation-Item"]')
        .contains("Resources")
        .click();

      // Expect two rows to be added to the table
      // lsm::LifecycleTransfer
      // frontend_model::TestResource
      cy.get('[aria-label="Resource Table Row"]', { timeout: 30000 }).should(
        "have.length",
        2,
      );
      cy.get('[aria-label="Resource Table Row"]')
        .eq(0)
        .should("contain", "frontend_model::TestResource");
      cy.get('[aria-label="Resource Table Row"]')
        .eq(1)
        .should("contain", "lsm::LifecycleTransfer");

      // click on frontend_model::TestResource Show Details
      cy.get('[aria-label="Resource Table Row"]')
        .eq(0)
        .find("button")
        .contains("Show Details")
        .click();

      // Expect to find this information in table :
      cy.get(".pf-v6-c-description-list__group")
        .eq(0)
        .should("contain", "name")
        .and("contain", "default-0001");
      cy.get(".pf-v6-c-description-list__group")
        .eq(1)
        .should("contain", "purge_on_delete")
        .and("contain", "false");
      cy.get(".pf-v6-c-description-list__group")
        .eq(2)
        .should("contain", "purged")
        .and("contain", "false");
      cy.get(".pf-v6-c-description-list__group")
        .eq(3)
        .should("contain", "receive_events")
        .and("contain", "true");
      cy.get(".pf-v6-c-description-list__group")
        .eq(4)
        .should("contain", "send_event")
        .and("contain", "true");
      cy.get(".pf-v6-c-description-list__group")
        .eq(5)
        .should("contain", "should_deploy_fail")
        .and("contain", "false");

      // Click on Requires tab
      cy.get("button").contains("Requires").click();

      // Expect it to be empty
      cy.get('[aria-label="ResourceRequires-Empty"]').should(
        "contain",
        "No requirements found",
      );

      // Click on history tab
      cy.get("button").contains("History").click();

      // Expect One row to be visible
      cy.get('[aria-label="Resource History Table Row"]').should(
        "have.length",
        1,
      );

      // Expect row to have 0 Requires
      cy.get('[data-label="Requires"]').should("contain", "0");

      // click row open
      cy.get('[aria-label="Details"]').click();

      // Expect content to be the same as on main Desired State tab
      cy.get(".pf-v6-c-description-list__group")
        .eq(2)
        .should("contain", "name")
        .and("contain", "default-0001");
      cy.get(".pf-v6-c-description-list__group")
        .eq(3)
        .should("contain", "purge_on_delete")
        .and("contain", "false");
      cy.get(".pf-v6-c-description-list__group")
        .eq(4)
        .should("contain", "purged")
        .and("contain", "false");
      cy.get(".pf-v6-c-description-list__group")
        .eq(5)
        .should("contain", "receive_events")
        .and("contain", "true");
      cy.get(".pf-v6-c-description-list__group")
        .eq(6)
        .should("contain", "send_event")
        .and("contain", "true");
      cy.get(".pf-v6-c-description-list__group")
        .eq(7)
        .should("contain", "should_deploy_fail")
        .and("contain", "false");

      // Expect requires tab to have no requirements
      cy.get(".pf-v6-c-tabs__list")
        .eq(1)
        .find("button")
        .contains("Requires")
        .click();
      cy.get('[aria-label="Requires"]')
        .find("tbody")
        .should("contain", "No requirements found");

      // Go to logs tab
      cy.get("button").contains("Logs").click();

      // Expect it to have : 7 log messages
      cy.get('[aria-label="ResourceLogRow"]', { timeout: 40000 }).should(
        "to.have.length.of.at.least",
        7,
      );

      // make sure the default is 100 instead of 20 like on other pages with pagination.
      cy.get(
        '[aria-label="PaginationWidget-top"] .pf-v6-c-menu-toggle',
      ).click();
      cy.contains(".pf-v6-c-menu__list-item", "100")
        .find("svg")
        .should("exist");

      // Expect last log message to be "Setting deployed due to known good status"
      cy.get('[aria-label="ResourceLogRow"]')
        .eq(0)
        .should("contain", "Setting deployed due to known good status");

      // Click top message open
      cy.get('[aria-label="Details"]').eq(0).click();

      // Expect to find "Setting deployed due to known good status" displayed in expansion.
      cy.get(".pf-v6-c-description-list__text").should(
        "contain",
        "Setting deployed due to known good status",
      );
    });

    it("6.3 Log message filtering", () => {
      // Select Test environment
      cy.visit("/console/");
      cy.get(`[aria-label="Select-environment-test"]`).click();

      // Go to Resources page
      cy.get('[aria-label="Sidebar-Navigation-Item"]')
        .contains("Resources")
        .click();

      // click on frontend_model::TestResource Show Details
      cy.get('[aria-label="Resource Table Row"]')
        .eq(0)
        .find("button")
        .contains("Show Details")
        .click();

      // Go to logs tab
      cy.get("button").contains("Logs").click();

      // Filter on "INFO" for Minimal Log Level
      cy.get('[aria-label="MinimalLogLevelFilterInput"]').click();
      cy.get('[role="option"]').contains("INFO").click();

      // Expect the amount of rows to be max  6
      cy.get('[aria-label="ResourceLogRow"]').should(
        "to.have.length.of.at.most",
        6,
      );

      // Remove INFO filter
      cy.get('[aria-label="Close INFO"]').click();

      // Expect amount of rows to be bigger than before filtering.
      cy.get('[aria-label="ResourceLogRow"]').should(
        "to.have.length.of.at.least",
        7,
      );
    });

    it("6.4 Resources with multiple dependencies", () => {
      // Select Test environment
      cy.visit("/console/");
      cy.get(`[aria-label="Select-environment-test"]`).click();

      // Go to Service Catalog page
      cy.get('[aria-label="Sidebar-Navigation-Item"]')
        .contains("Service Catalog")
        .click();

      // Click on Show Inventory on dependency-service
      cy.get("#dependency-service").contains("Show inventory").click();

      // add instance
      cy.get("#add-instance-button").click();
      cy.get("#name").type("dependency-service");
      cy.get("#waiting_entity").type("waiting-entity");

      cy.get('[aria-label="Type to filter"]').type("a");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("b");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("c");
      cy.get("button").contains("Add").click();

      cy.get("#service_id").type("0009");

      cy.get("button").contains("Confirm").click();

      cy.get('[aria-label="Instance-Details-Success"]', {
        timeout: 20000,
      }).should("to.be.visible");

      // Go to Resource page
      cy.get('[aria-label="Sidebar-Navigation-Item"]')
        .contains("Resources")
        .click();

      // Expect to find 7 rows now in the resource table.
      cy.get('[aria-label="Resource Table Row"]', { timeout: 60000 }).should(
        "have.length",
        7,
      );
      // Expect to find a resource with value: a, b, c
      cy.get('[aria-label="Resource Table Row"]').eq(0).should("contain", "a");
      cy.get('[aria-label="Resource Table Row"]').eq(1).should("contain", "b");
      cy.get('[aria-label="Resource Table Row"]').eq(2).should("contain", "c");
      cy.get('[aria-label="Resource Table Row"]')
        .eq(3)
        .should("contain", "default-0001");

      // Expect resource with value a,b,c,default-0001 to have 0 Requires
      cy.get('[data-label="Requires"]').eq(0).should("contain", 0);
      cy.get('[data-label="Requires"]').eq(1).should("contain", 0);
      cy.get('[data-label="Requires"]').eq(2).should("contain", 0);
      cy.get('[data-label="Requires"]').eq(3).should("contain", 0);

      // Expect resource with value waiting-entity to have 3 Requires
      cy.get('[data-label="Requires"]').eq(4).should("contain", 3);

      // Click open collapsible row for resource waiting-entity
      cy.get(
        '[aria-label="Toggle-frontend_model::TestResource[internal,name=waiting-entity]"] > button',
        { timeout: 20000 },
      ).click();
      // Expect to find three rows with
      cy.get('[aria-label="ResourceRequires-Success"]', {
        timeout: 20000,
      }).should(($table) => {
        const $rows = $table.find("tr");

        // 3 rows and one header row.
        expect($rows).to.have.length(4);

        expect($rows.eq(1).find("button"), "a-row").to.have.text(
          "frontend_model::TestResource[internal,name=a]",
        );
        expect($rows.eq(2).find("button"), "b-row").to.have.text(
          "frontend_model::TestResource[internal,name=b]",
        );
        expect($rows.eq(3).find("button"), "c-row").to.have.text(
          "frontend_model::TestResource[internal,name=c]",
        );
      });

      // click on show details on waiting-entity
      cy.get('[aria-label="Resource Table Row"]')
        .eq(4)
        .find("button")
        .contains("Show Details")
        .click();

      // go to requires tab
      cy.get("button").contains("Requires").click();

      // expect again to find
      // frontend_model::TestResource[internal,name=a]
      // frontend_model::TestResource[internal,name=b]
      // frontend_model::TestResource[internal,name=c]
      cy.get('[aria-label="ResourceRequires-Success"]', {
        timeout: 20000,
      }).should(($table) => {
        const $rows = $table.find("tr");

        // 3 rows and one header row.
        expect($rows).to.have.length(4);

        expect($rows.eq(1).find("button"), "a-row").to.have.text(
          "frontend_model::TestResource[internal,name=a]",
        );
        expect($rows.eq(2).find("button"), "b-row").to.have.text(
          "frontend_model::TestResource[internal,name=b]",
        );
        expect($rows.eq(3).find("button"), "c-row").to.have.text(
          "frontend_model::TestResource[internal,name=c]",
        );
      });

      // go to history tab
      cy.get("button").contains("History").click();

      cy.get('[aria-label="Resource History Table Row"]').should(
        "have.length",
        1,
      );

      // expect to find one collapsible with 3 Requires
      cy.get('[data-label="Requires"]').should("contain", "3");

      // go back to requires tab
      cy.get("button").contains("Requires").click();

      // click on first required resource link frontend_model::TestResource[internal,name=a]
      cy.get("button")
        .contains("frontend_model::TestResource[internal,name=a]")
        .click();

      // check title from this page, should have the name of the resource
      cy.get(".pf-v6-c-content")
        .contains("frontend_model::TestResource[internal,name=a]")
        .should("to.be.visible");

      // go back to Resource page
      cy.get('[aria-label="Sidebar-Navigation-Item"]')
        .contains("Resources")
        .click();

      // click show details on resource with value waiting-entity
      cy.get('[aria-label="Resource Table Row"]')
        .eq(4)
        .find("button")
        .contains("Show Details")
        .click();

      cy.get("button").contains("Requires").click();

      // click on first resource frontend_model::TestResource[internal,name=a]
      cy.get("button")
        .contains("frontend_model::TestResource[internal,name=a]")
        .click();

      // Expect to be on the same page with same title as before.
      cy.get(".pf-v6-c-content")
        .contains("frontend_model::TestResource[internal,name=a]")
        .should("to.be.visible");
    });

    it("6.5 Pagination", () => {
      // Select Test environment
      cy.visit("/console/");

      cy.get(`[aria-label="Select-environment-test"]`).click();

      // Go to Service Catalog
      cy.get('[aria-label="Sidebar-Navigation-Item"]')
        .contains("Service Catalog")
        .click();

      // Select Show Inventory on dependency-service and add one with 41 dependencies
      cy.get("#dependency-service").contains("Show inventory").click();
      cy.get("#add-instance-button").click();

      cy.get("#waiting_entity").type("waiting-0002");
      cy.get("#service_id").type("ds-0002");
      cy.get("#name").type("dependency-service-0002");
      //dependencies
      cy.get('[aria-label="Type to filter"]').type("1");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("2");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("3");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("4");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("5");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("6");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("7");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("8");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("9");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("10");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("11");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("12");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("13");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("14");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("15");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("16");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("17");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("18");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("19");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("20");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("21");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("22");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("23");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("24");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("25");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("26");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("27");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("28");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("29");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("30");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("31");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("32");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("33");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("34");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("35");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("36");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("37");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("38");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("39");
      cy.get("button").contains("Add").click();
      cy.get('[aria-label="Type to filter"]').type("40");
      cy.get("button").contains("Add").click();

      cy.get("button").contains("Confirm").click();

      cy.get('[aria-label="Instance-Details-Success"]', {
        timeout: 20000,
      }).should("to.be.visible");

      cy.get('[aria-label="Sidebar-Navigation-Item"]')
        .contains("Service Catalog")
        .click();
      cy.get("#waiting_entity").contains("Show inventory").click();

      // Expect the number in the chart to the success label to be 8
      cy.get(".pf-v5-c-chart").within(() => {
        cy.get("#legend-ChartLabel-2", { timeout: 90000 }).should(
          "contain",
          "success: 2",
        );
      });

      //Wait for compilation to end
      cy.get('[aria-label="CompileReportsIndication"]', {
        timeout: 90000,
      }).should("not.to.exist");

      //Go to resources page
      cy.get('[aria-label="Sidebar-Navigation-Item"]')
        .contains("Resources")
        .click();
      cy.get('[aria-label="LegendItem-deployed"]', { timeout: 60000 }).should(
        "have.text",
        "49",
      );

      cy.get(
        "#PaginationWidget-top-top-toggle > .pf-v6-c-menu-toggle__text > b:first-of-type",
      ).should("have.text", "1 - 20");

      //Go to next page
      cy.get('[aria-label="Go to next page"]').first().click();
      cy.get('[aria-label="ResourcesView-Success"]').should("be.visible");
      cy.get(
        "#PaginationWidget-top-top-toggle > .pf-v6-c-menu-toggle__text > b:first-of-type",
      ).should("have.text", "21 - 40");

      //Go to last page
      cy.get('[aria-label="Go to next page"]').first().click();
      cy.get('[aria-label="ResourcesView-Success"]').should("be.visible");
      cy.get(
        "#PaginationWidget-top-top-toggle > .pf-v6-c-menu-toggle__text > b:first-of-type",
      ).should("have.text", "41 - 49");

      //Go to previous page
      cy.get('[aria-label="Go to previous page"]').first().click();
      cy.get('[aria-label="ResourcesView-Success"]').should("be.visible");

      cy.get(
        "#PaginationWidget-top-top-toggle > .pf-v6-c-menu-toggle__text > b:first-of-type",
      ).should("have.text", "21 - 40");

      // Change sorting and expect to be redirected to the first page of the table
      cy.get("button").contains("Type").click();
      cy.get(
        "#PaginationWidget-top-top-toggle > .pf-v6-c-menu-toggle__text > b:first-of-type",
      ).should("have.text", "1 - 20");
    });
  } else {
    it("6.6 Resources for OSS", () => {
      cy.visit("/console/");

      cy.get(`[aria-label="Select-environment-test"]`).click();

      cy.get('[aria-label="Sidebar-Navigation-Item"]')
        .contains("Resources")
        .click();

      cy.get('[aria-label="Resource Table Row"]', { timeout: 30000 }).should(
        "have.length",
        5,
      );
      cy.get('[aria-label="Resource Table Row"]')
        .eq(0)
        .should("contain", "frontend_model::TestResource");
      cy.get('[aria-label="Resource Table Row"]')
        .eq(1)
        .should("contain", "frontend_model::TestResource");
      cy.get('[aria-label="Resource Table Row"]')
        .eq(2)
        .should("contain", "frontend_model::TestResource");
      cy.get('[aria-label="Resource Table Row"]')
        .eq(3)
        .should("contain", "frontend_model::TestResource");
      cy.get('[aria-label="Resource Table Row"]')
        .eq(4)
        .should("contain", "frontend_model::TestResource");

      cy.get('[aria-label="Resource Table Row"]')
        .eq(0)
        .find("button")
        .contains("Show Details")
        .click();

      // Expect to find the right information on the details page.
      cy.get(".pf-v6-c-description-list__group")
        .eq(0)
        .should("contain", "name")
        .and("contain", "a");
      cy.get(".pf-v6-c-description-list__group")
        .eq(1)
        .should("contain", "purge_on_delete")
        .and("contain", "false");
      cy.get(".pf-v6-c-description-list__group")
        .eq(2)
        .should("contain", "purged")
        .and("contain", "false");
      cy.get(".pf-v6-c-description-list__group")
        .eq(3)
        .should("contain", "receive_events")
        .and("contain", "true");
      cy.get(".pf-v6-c-description-list__group")
        .eq(4)
        .should("contain", "send_event")
        .and("contain", "true");
      cy.get(".pf-v6-c-description-list__group")
        .eq(5)
        .should("contain", "should_deploy_fail")
        .and("contain", "false");

      // Click on Requires tab
      cy.get("button").contains("Requires").click();

      // Expect it to be empty
      cy.get('[aria-label="ResourceRequires-Empty"]').should(
        "contain",
        "No requirements found",
      );

      // Click on history tab
      cy.get("button").contains("History").click();

      // Expect One row to be visible
      cy.get('[aria-label="Resource History Table Row"]').should(
        "have.length",
        1,
      );

      // Expect row to have 0 Requires
      cy.get('[data-label="Requires"]').should("contain", "0");

      // click row open
      cy.get('[aria-label="Details"]').click();
      // Expect content to be the same as on main Desired State tab
      cy.get(".pf-v6-c-description-list__group")
        .eq(2)
        .should("contain", "name")
        .and("contain", "a");
      cy.get(".pf-v6-c-description-list__group")
        .eq(3)
        .should("contain", "purge_on_delete")
        .and("contain", "false");
      cy.get(".pf-v6-c-description-list__group")
        .eq(4)
        .should("contain", "purged")
        .and("contain", "false");
      cy.get(".pf-v6-c-description-list__group")
        .eq(5)
        .should("contain", "receive_events")
        .and("contain", "true");
      cy.get(".pf-v6-c-description-list__group")
        .eq(6)
        .should("contain", "send_event")
        .and("contain", "true");
      cy.get(".pf-v6-c-description-list__group")
        .eq(7)
        .should("contain", "should_deploy_fail")
        .and("contain", "false");

      // Expect requires tab to have no requirements
      cy.get(".pf-v6-c-tabs__list")
        .eq(1)
        .find("button")
        .contains("Requires")
        .click();
      cy.get('[aria-label="Requires"]')
        .find("tbody")
        .should("contain", "No requirements found");

      // Go to logs tab
      cy.get("button").contains("Logs").click();
      // Expect it to have : 8 log messages
      cy.get('[aria-label="ResourceLogRow"]', { timeout: 40000 }).should(
        "to.have.length.of.at.least",
        5,
      );

      // make sure the default is 100 instead of 20 like on other pages with pagination.
      cy.get(
        '[aria-label="PaginationWidget-top"] .pf-v6-c-menu-toggle',
      ).click();
      cy.contains(".pf-v6-c-menu__list-item", "100")
        .find("svg")
        .should("exist");

      // Expect last log message to contain "Setting deployed due to known good status"
      cy.get('[aria-label="ResourceLogRow"]')
        .eq(0)
        .should("contain", "Setting deployed due to known good status");

      // Click top message open
      cy.get('[aria-label="Details"]').eq(0).click();

      // Expect to find "Setting deployed due to known good status" displayed in expansion.
      cy.get(".pf-v6-c-description-list__text").should(
        "contain",
        "Setting deployed due to known good status",
      );
    });
  }
});
