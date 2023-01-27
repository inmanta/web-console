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

describe("5 Compile reports", () => {
  it("5.1 initial state", () => {
    cy.visit("/console/");

    cy.get('[aria-label="Environment card"]').contains("lsm-frontend").click();
    cy.get(".pf-c-nav__item").contains("Service Catalog").click();

    // go to compile reports page
    cy.get(".pf-c-nav__link").contains("Compile Reports").click();

    // expect it to have 1 item shown in the table
    cy.get("tbody").should(($tableBody) => {
      const $rows = $tableBody.find("tr");

      expect($rows).to.have.length(1);
      expect($rows.eq(0), "top-row-message").to.contain(
        "Recompile model to export service definition"
      );
      expect($rows.eq(0), "top-row-status").to.contain("success");
    });

    // click on recompile button
    cy.get("button").contains("Recompile").click();

    // expect row to be added in table
    cy.get("tbody").should(($tableBody) => {
      const $rows = $tableBody.find("tr");

      expect($rows).to.have.length(2);
      expect($rows.eq(0), "top-row-message").to.contain(
        "Compile triggered from the console"
      );
      expect($rows.eq(0), "top-row-status").to.contain("queued");
    });

    // await end of compilation and expect it to be success
    cy.get("tbody", { timeout: 30000 }).should(($tableBody) => {
      const $rows = $tableBody.find("tr");

      expect($rows.eq(0), "top-row-message").to.contain(
        "Compile triggered from the console"
      );
      expect($rows.eq(0), "top-row-status").to.contain("success");
    });

    // click on show details
    cy.get("button").contains("Show Details").eq(0).click();

    // Expect to be redirected to compile details page
    cy.get(".pf-c-title").contains("Compile Details").should("to.be.visible");

    // Expect message to be : Compile triggered from the console
    cy.get(".pf-c-description-list__group")
      .eq(3)
      .should("contain", "Compile triggered from the console");

    // Expect to have no environment variables
    cy.get(".pf-c-code-block__content").should("have.text", "{}");

    // Expect to have 2 stages in collapsibles
    cy.get("tbody").should(($rowElements) => {
      expect($rowElements).to.have.length(2);
    });

    // Click on init stage arrow
    cy.get("#expand-toggle0").click();

    // expect to see Command Empty, Return code 0 an output stream and no error stream.
    cy.get(".pf-c-table__expandable-row.pf-m-expanded")
      .find(".pf-c-description-list__group")
      .should(($rowGroups) => {
        expect($rowGroups).to.have.length(4);

        expect($rowGroups.eq(0), "Command-row").to.contain("Empty");
        expect($rowGroups.eq(1), "Return-code-row").to.contain("0");
        expect($rowGroups.eq(2), "Output-stream-row").to.contain(
          "Using extra environment variables during compile"
        );
      });
  });

  it("5.2 Compile after adding a Service instance", () => {
    // go to home page
    cy.visit("/console/");

    // click on test environment card
    cy.get('[aria-label="Environment card"]').contains("lsm-frontend").click();
    cy.get(".pf-c-nav__item").contains("Service Catalog").click();

    // Click on Show Inventory on basic service
    cy.get("#basic-service").contains("Show inventory").click();
    cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");

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

    // Go to compiled Reports page
    cy.get(".pf-c-nav__link").contains("Compile Reports").click();

    // Expect all compiles to be succesful
    cy.get("tbody", { timeout: 60000 }).should(($tableBody) => {
      const $rows = $tableBody.find("tr");

      expect($rows).to.have.length(5);

      // Expect latest row to be having the message: Recompile model because state transition
      expect($rows.eq(0), "top-row-message").to.contain(
        "Recompile model because state transition"
      );
      expect($rows.eq(1), "second-row-message").to.contain(
        "Recompile model because state transition"
      );
      expect($rows.eq(2), "third-row-message").to.contain(
        "Recompile model because state transition (validate)"
      );
      expect($rows.eq(0), "top-row-status").to.contain("success");
      expect($rows.eq(1), "second-row-status").to.contain("success");
      expect($rows.eq(2), "third-row-status").to.contain("success");
      expect($rows.eq(3), "fourth-row-status").to.contain("success");
      expect($rows.eq(4), "fifth-row-status").to.contain("success");
    });

    // click on Show Details on top row
    cy.get("button").contains("Show Details").eq(0).click();

    // Expect to be redirected to compile details page
    cy.get(".pf-c-title").contains("Compile Details").should("to.be.visible");

    // Expect trigger to be lsm_export
    cy.get(".pf-c-description-list__group")
      .eq(4)
      .should("contain", "lsm_export");

    // Expect environment variables inmanta_model_state: active
    cy.get("pre")
      .eq(0)
      .should("contain", "active")
      .and("contain", "inmanta_model_state");
  });

  it("5.3 Compile after adding a rejected Service Instance", () => {
    // go to home page
    cy.visit("/console/");

    // click on test environment card
    cy.get('[aria-label="Environment card"]').contains("lsm-frontend").click();
    cy.get(".pf-c-nav__item").contains("Service Catalog").click();

    // Click on Show Inventory on basic-service
    cy.get("#basic-service").contains("Show inventory").click();

    // Add Instance
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
    cy.get("#name").type("basic-service2");
    cy.get("button").contains("Confirm").click();

    // Expect to see a rejected service instance in the table
    cy.get("tbody", { timeout: 30000 }).should(($tableBody) => {
      const $rows = $tableBody.find(".pf-c-table__expandable-row");

      expect($rows).to.have.length(2);

      expect($rows.eq(0), "top-row-status").to.contain("rejected");
    });

    // Go to the compile report page
    cy.get(".pf-c-nav__link").contains("Compile Reports").click();

    // expect the last compile to be failed.
    cy.get("tbody", { timeout: 30000 }).should(($tableBody) => {
      const $rows = $tableBody.find("tr");

      expect($rows).to.have.length(6);

      // Expect one row to be having the message: Recompile model because state transition (validate)
      expect($rows.eq(0), "top-row-message").to.contain(
        "Recompile model because state transition (validate)"
      );
      expect($rows.eq(0), "top-row-status").to.contain("failed");
    });

    // Click on Show details on last compile
    cy.get("button").contains("Show Details").eq(0).click();

    // Expect to be redirected to compile details page
    cy.get(".pf-c-title").contains("Compile Details").should("to.be.visible");

    // Expect trigger to be lsm
    cy.get(".pf-c-description-list__group").eq(4).should("contain", "lsm");

    // Expect Error Type : inmanta.ast.AttributeException
    cy.get(".pf-c-description-list__description")
      .eq(6)
      .should("contain", "inmanta.ast.AttributeException");
  });

  it("5.4 Remove rejected instance should fix compile", () => {
    // go to home page
    cy.visit("/console/");

    // click on test environment card
    cy.get('[aria-label="Environment card"]').contains("lsm-frontend").click();
    cy.get(".pf-c-nav__item").contains("Service Catalog").click();

    // Click on Show Inventory on basic-service
    cy.get("#basic-service").contains("Show inventory").click();

    // Open rejected instance row
    cy.get("#expand-toggle0").click();

    // delete instance
    cy.get(".pf-c-description-list", { timeout: 60000 })
      .contains("Delete")
      .click();

    // confirm modal
    cy.get(".pf-c-form__actions").contains("Yes").click();

    // expect resource to be deleted
    cy.get(".pf-c-table__toggle", { timeout: 25000 }).should("have.length", 1);

    // go back to Compile Reports
    cy.get(".pf-c-nav__link").contains("Compile Reports").click();

    // Expect no new compiles to be visible. The last compile report is a failed one.
    cy.get("tbody", { timeout: 30000 }).should(($tableBody) => {
      const $rows = $tableBody.find("tr");

      expect($rows).to.have.length(6);

      // Expect one row to be having the message: Recompile model because state transition (validate)
      expect($rows.eq(0), "top-row-message").to.contain(
        "Recompile model because state transition (validate)"
      );
      expect($rows.eq(0), "top-row-status").to.contain("failed");
    });

    // Click on recompile button
    cy.get("button").contains("Recompile").click();

    // Expect the new compile to be sucessful.
    cy.get("tbody", { timeout: 30000 }).should(($tableBody) => {
      const $rows = $tableBody.find("tr");

      expect($rows).to.have.length(7);

      // Expect one row to be having the message: Recompile model because state transition (validate)
      expect($rows.eq(0), "top-row-message").to.contain(
        "Compile triggered from the console"
      );
      expect($rows.eq(0), "top-row-status").to.contain("success");
    });
  });

  it("5.5 Filter based on status", () => {
    // go to home page
    cy.visit("/console/");

    // click on test environment card
    cy.get('[aria-label="Environment card"]').contains("lsm-frontend").click();
    cy.get(".pf-c-nav__item").contains("Service Catalog").click();

    // Go to the compile report page
    cy.get(".pf-c-nav__link").contains("Compile Reports").click();

    // Click on filter dropdown
    cy.get(".pf-c-select").eq(1).click();

    // select failed
    cy.get("button").contains("failed").click();

    // expect only one row to be visible now in the table
    cy.get("tbody", { timeout: 30000 }).should(($tableBody) => {
      const $rows = $tableBody.find("tr");

      expect($rows).to.have.length(1);

      // Expect one row to be having the message: Recompile model because state transition (validate)
      expect($rows.eq(0), "top-row-message").to.contain(
        "Recompile model because state transition (validate)"
      );
      expect($rows.eq(0), "top-row-status").to.contain("failed");
    });

    // click on clear all filters
    cy.get(".pf-c-toolbar__item").find("button").eq(6).click();

    // expect to have the original lenght of the table
    cy.get("tbody", { timeout: 30000 }).should(($tableBody) => {
      const $rows = $tableBody.find("tr");

      expect($rows).to.have.length(7);
    });
  });

  it("5.6 Pagination", () => {
    // go to home page
    cy.visit("/console/");

    // click on test environment card
    cy.get('[aria-label="Environment card"]').contains("lsm-frontend").click();
    cy.get(".pf-c-nav__item").contains("Service Catalog").click();

    // Go to the compile report page
    cy.get(".pf-c-nav__link").contains("Compile Reports").click();

    // click on pagination
    cy.get('[aria-label="Page Size Selector dropdown"]').click();
    // select 5
    cy.get(".pf-c-dropdown__menu-item").contains("5").click();

    // expect only 5 rows to be visible now
    cy.get("tbody", { timeout: 30000 }).should(($tableBody) => {
      const $rows = $tableBody.find("tr");

      expect($rows).to.have.length(5);
    });

    // next page
    cy.get('[aria-label="Next"]').click();

    // expect only 2 rows to be visible now
    cy.get("tbody", { timeout: 30000 }).should(($tableBody) => {
      const $rows = $tableBody.find("tr");

      expect($rows).to.have.length(2);
    });

    // click on pagination
    cy.get('[aria-label="Page Size Selector dropdown"]').click();

    // select 10
    cy.get(".pf-c-dropdown__menu-item").contains("10").click();

    // expect 7 rows to be visible now again
    cy.get("tbody", { timeout: 30000 }).should(($tableBody) => {
      const $rows = $tableBody.find("tr");

      expect($rows).to.have.length(7);
    });
  });
});
