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
    cy.intercept(`/api/v2/graphql`).as("IsCompiling");
    // the timeout is necessary to avoid errors.
    // Cypress doesn't support while loops and this was the only workaround to wait till the statuscode is not 200 anymore.
    // the default timeout in cypress is 5000, but since we have recursion it goes into timeout for the nested awaits because of the recursion.
    cy.wait("@IsCompiling", { timeout: 10000 }).then((req) => {
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
      } else {
        //this endpoint is also used for notifications, so we don't need to call it again in that case, it will lower the amount of awaits
        return
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

const isIso = Cypress.env("edition") === "iso";

describe("5 Compile reports", () => {
  if (isIso) {
    before(() => {
      clearEnvironment();
      forceUpdateEnvironment();
    });
  }

  it("5.1 initial state", () => {
    cy.visit("/console/");

    cy.get('[aria-label="Select-environment-test"]').click();

    // go to compile reports page
    cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Compile Reports").click();

    // expect it to have 2 item shown in the table, or 3 if it is the OSS edition
    cy.get("tbody", { timeout: 30000 }).should(($tableBody) => {
      const $rows = $tableBody.find("tr");

      expect($rows).to.have.length(isIso ? 2 : 3);

      expect($rows.eq(0), "top-row-message").to.contain(
        isIso
          ? "Recompile model to generate resources using the updated service definition and modules"
          : "Compile triggered from the console"
      );
      expect($rows.eq(0), "top-row-status").to.contain("success");
    });

    // click on recompile button
    cy.get("button").contains("Recompile").click();

    // expect row to be added in table
    cy.get("tbody").should(($tableBody) => {
      const $rows = $tableBody.find("tr");

      expect($rows.eq(0), "top-row-message").to.contain("Compile triggered from the console");

      expect($rows).length.to.be.at.least(isIso ? 2 : 4);
    });

    // await end of compilation and expect it to be success
    cy.get("tbody", { timeout: 30000 }).should(($tableBody) => {
      const $rows = $tableBody.find("tr");

      expect($rows.eq(0), "top-row-message").to.contain("Compile triggered from the console");
      expect($rows.eq(0), "top-row-status").to.contain("success");
    });

    // click on show details
    cy.get("button").contains("Show Details").eq(0).click();

    // Expect to be redirected to compile details page
    cy.get("h1").contains("Compile Details").should("to.exist");

    // Expect message to be : Compile triggered from the console
    cy.get(".pf-v6-c-description-list__group")
      .eq(2)
      .should("contain", "Compile triggered from the console");

    // Expect to have no environment variables
    cy.get(".pf-v6-c-code-block__content").should("have.text", "{}");

    // click on the select to pick a different stage
    cy.get("button").contains("Recompiling configuration model").click();

    // Click on the last menu item
    cy.get(".pf-v6-c-menu__list-item").first().click();

    // expect the text in the toggle now to be Recompiling configuration model
    cy.get("button").contains("Init").should("exist");

    // Expect to find text about environment variables
    cy.get("span").contains("Using extra environment variables during compile").should("exist");
  });

  if (isIso) {
    it("5.2 Compile after adding a Service instance", () => {
      // go to home page
      cy.visit("/console/");

      // click on test environment card
      cy.get('[aria-label="Select-environment-test"]').click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();

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

      cy.get('[aria-label="Instance-Details-Success"]', {
        timeout: 20000,
      }).should("to.be.visible");

      // Go to compiled Reports page
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Compile Reports").click();

      // Expect all compiles to be succesful
      cy.get("tbody", { timeout: 60000 }).should(($tableBody) => {
        const $rows = $tableBody.find("tr");

        expect($rows).to.have.length(6);

        // Expect latest row to be having the message: Recompile model because of state transition from creating to up
        expect($rows.eq(0), "top-row-message").to.contain(
          "Recompile model because of state transition from creating to up"
        );
        expect($rows.eq(1), "second-row-message").to.contain(
          "Recompile model because of state transition from start to creating"
        );
        expect($rows.eq(2), "third-row-message").to.contain(
          "Recompile model to validate state transition from start to creating"
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
      cy.get("h1").contains("Compile Details").should("to.exist");

      // Expect trigger to be lsm_export
      cy.get(".pf-v6-c-description-list__group").eq(3).should("contain", "lsm_export");

      // Expect environment variables inmanta_model_state: active
      cy.get("pre").eq(0).should("contain", "active").and("contain", "inmanta_model_state");
    });

    it("5.3 Compile after adding a rejected Service Instance", () => {
      // go to home page
      cy.visit("/console/");

      // click on test environment card
      cy.get('[aria-label="Select-environment-test"]').click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();

      // Click on Show Inventory on basic-service
      cy.get("#basic-service").contains("Show inventory").click();

      // click on duplicate instance
      cy.get('[aria-label="row actions toggle"]', { timeout: 60000 }).eq(0).click();
      cy.get('[role="menuitem"]').contains("Duplicate").click();

      // Add Instance
      cy.get("#service_id").clear();
      cy.get("#service_id").type("0001");
      cy.get("#name").type("2");
      cy.get("button").contains("Confirm").click();

      cy.get('[aria-label="Instance-Details-Success"]', {
        timeout: 20000,
      }).should("to.be.visible");

      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#basic-service").contains("Show inventory").click();

      // Expect to see a rejected service instance in the table
      cy.get("tbody", { timeout: 30000 }).should(($tableBody) => {
        const $rows = $tableBody.find('tr[aria-label="InstanceRow-Intro"]');

        expect($rows).to.have.length(2);

        expect($rows.eq(0), "top-row-status").to.contain("rejected");
      });

      // Go to the compile report page
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Compile Reports").click();

      // expect the last compile to be failed.
      cy.get("tbody", { timeout: 30000 }).should(($tableBody) => {
        const $rows = $tableBody.find("tr");

        expect($rows).to.have.length(7);

        // Expect one row to be having the message: Recompile model to validate state transition from start to creating
        expect($rows.eq(0), "top-row-message").to.contain(
          "Recompile model to validate state transition from start to creating"
        );
        expect($rows.eq(0), "top-row-status").to.contain("failed");
      });

      // Click on Show details on last compile
      cy.get("button").contains("Show Details").eq(0).click();

      // Expect to be redirected to compile details page
      cy.get("h1").contains("Compile Details").should("to.exist");

      // Expect trigger to be lsm
      cy.get(".pf-v6-c-description-list__group").eq(3).should("contain", "lsm");

      // Expect Error Type : inmanta.ast.AttributeException
      cy.get(".pf-v6-c-description-list__description")
        .eq(5)
        .should("contain", "inmanta.ast.AttributeException");
    });

    it("5.4 Remove rejected instance should fix compile", () => {
      // go to home page
      cy.visit("/console/");

      // click on test environment card
      cy.get('[aria-label="Select-environment-test"]').click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();

      // Click on Show Inventory on basic-service
      cy.get("#basic-service").contains("Show inventory").click();

      // Delete rejected instance row
      cy.get('[aria-label="row actions toggle"]', { timeout: 60000 }).eq(0).click();

      cy.get('[role="menuitem"]').contains("Delete").click();

      // confirm modal
      cy.get(".pf-v6-c-form__actions").contains("Yes").click();

      // go back to Compile Reports
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Compile Reports").click();

      // Expect no new compiles to be visible. The last compile report is a failed one.
      cy.get("tbody", { timeout: 30000 }).should(($tableBody) => {
        const $rows = $tableBody.find("tr");

        expect($rows).to.have.length(7);

        // Expect one row to be having the message: Recompile model to validate state transition from start to creating
        expect($rows.eq(0), "top-row-message").to.contain(
          "Recompile model to validate state transition from start to creating"
        );
        expect($rows.eq(0), "top-row-status").to.contain("failed");
      });

      // Click on recompile button
      cy.get("button").contains("Recompile").click();

      // Expect the new compile to be sucessful.
      cy.get("tbody", { timeout: 30000 }).should(($tableBody) => {
        const $rows = $tableBody.find("tr");

        expect($rows).to.have.length(8);

        // Expect one row to be having the message: Recompile model because state transition (validate)
        expect($rows.eq(0), "top-row-message").to.contain("Compile triggered from the console");
        expect($rows.eq(0), "top-row-status").to.contain("success");
      });
    });

    it("5.5 Filter based on status", () => {
      // go to home page
      cy.visit("/console/");

      // click on test environment card
      cy.get('[aria-label="Select-environment-test"]').click();

      // Go to the compile report page
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Compile Reports").click();

      // Click on filter dropdown
      cy.get('[aria-label="StatusFilterInput"]').click();

      // select failed
      cy.get("button").contains("failed").click();

      // expect only one row to be visible now in the table
      cy.get("tbody", { timeout: 30000 }).should(($tableBody) => {
        const $rows = $tableBody.find("tr");

        expect($rows).to.have.length(1);

        // Expect one row to be having the message: Recompile model to validate state transition from start to creating
        expect($rows.eq(0), "top-row-message").to.contain(
          "Recompile model to validate state transition from start to creating"
        );
        expect($rows.eq(0), "top-row-status").to.contain("failed");
      });

      // click on clear all filters
      cy.get('[aria-label="Clear input value"]').click();

      // expect to have the original length of the table
      cy.get("tbody", { timeout: 30000 }).should(($tableBody) => {
        const $rows = $tableBody.find("tr");

        expect($rows).to.have.length(8);
      });
    });
  }
});
