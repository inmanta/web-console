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
    cy.get(".pf-c-table__toggle").eq(0).click();

    // expect to see Command Empty, Return code 0 an output stream and no error stream.
    cy.get("pf-c-table__expandable-row pf-m-expanded")
      .find(".pf-c-description-list__group")
      .should(($rowGroups) => {
        expect($rowGroups).to.have.length(4);

        expect($rowGroups.eq(0), "Command-row").to.contain("Empty");
      });
    // note: The output stream is using uuids which can't be used to validate an assertion. We will assume this is also thoroughly tested on the BE. We will assert that there is an output.
    // Go back to report page by clicking on breadcrumb
    // Expect to still see one Compile report in table.
  });

  it("5.2 Compile after adding a Service instance", () => {
    // Go to Service Catalog
    // Click on Show Inventory on basic service
    // Add instance
    // Submit form
    // Go to compiled Reports page
    // Expect one row to be having the message:
    // Recompile model because state transition (validate)
    // Expect two rows to be having the message:
    // Recompile model because state transition
    // Expect all compiles to be succesful
    // click on Show Details on top row
    // Expect trigger to be lsm_export
    // Expect environment variables to be
  });

  it("5.3 Compile after adding a rejected Service Instance", () => {
    // Go to Service Catalog
    // Click on Show Inventory on basic-service
    // Add Instance
    // Expect to see a rejected service instance in the table
    // Go to the compile report page
    // expect the last compile to be failed.
    // Click on Show details on last compile
    // Expect trigger to be lsm
    // Expect Icon under Completed text to be a red exclamation icon
    // Expect Error Type : inmanta.ast.AttributeException
  });

  it("5.4 Remove rejected instance should fix compile", () => {
    // Go back to Service Catalog
    // click on basic-service Show Inventory
    // Open rejected instance row
    // delete instance
    // confirm modal
    // expect resource to be deleted
    // go back to Compile Reports
    // Expect no new compiles to be visible. The last compile report is a failed one.
    // Click on recompile button
    // Expect the new compile to be sucessful.
  });

  it("5.5 Filter based on status", () => {
    // Click on filter dropdown
    // select failed
    // expect only one row to be visible now in the table
    // click on clear all filters
    // expect to have the original lenght of the table (10 items)
  });

  it("5.5 Filter based on status", () => {
    // click on pagination
    // select 5
    // expect only 5 rows to be visible now
  });
});
