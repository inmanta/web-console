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

describe("Scenario 4 Desired State", () => {
  it("4.1 Initial setup", () => {
    // Go from Home page to Service Inventory of Basic-service
    cy.visit("/console/");
    cy.get('[aria-label="Environment card"]').contains("lsm-frontend").click();
    cy.get("#basic-service").contains("Show inventory").click();
    cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");

    // Add an instance and fill form
    cy.get("#add-instance-button").click();
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
    // Should show the chart
    cy.get(".pf-c-chart").should("be.visible");

    // Should show the ServiceInventory-Success Component.
    cy.get('[aria-label="ServiceInventory-Success"]').should("to.be.visible");
    // Check if only one row has been added to the table.
    cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);

    //got to desired stated page
    cy.get(".pf-c-nav__link").contains("Desired State").click();
    cy.get('[aria-label="DesiredStatesView-Success"]', { timeout: 60000 })
      .find("tbody", { timeout: 60000 })
      .should("have.length", 2);
    cy.get('[data-label="Status"]').contains("active").should("have.length", 1);
    cy.get("tbody")
      .eq(0)
      .should("contain", "lsm_export")
      .and("contain", "active");
  });

  it("4.2 Desired state resources", () => {
    //go from desired State to Resources
    cy.get("tbody").eq(0).contains("Show Resources").click();
    cy.get('[aria-label="VersionResourcesTable-Success"]')
      .find("tbody")
      .should("have.length", 2);

    cy.get("tbody")
      .eq(0)
      .should("contain", "frontend_model::TestResource")
      .and("contain", "0");
    cy.get("tbody")
      .eq(1)
      .should("contain", "lsm::LifecycleTransfer")
      .and("contain", "1");
    //go to details of first resource
    cy.get("tbody").eq(0).contains("Show Details").click();
    cy.get(".pf-c-content").should(
      "have.text",
      "frontend_model::TestResource[internal,name=default-0001]"
    );
    //go back and open details of second resource
    cy.get('[aria-label="BreadcrumbItem"]').contains("Details").click();
    cy.get("tbody").eq(1).contains("Show Details").click();
    //go through each row and check value
    cy.get(".pf-c-description-list__group")
      .eq(1)
      .find(".pf-c-description-list__term")
      .should("have.text", "next_version");
    cy.get(".pf-c-description-list__group")
      .eq(1)
      .find(".pf-c-description-list__description")
      .should("have.text", "4");

    cy.get(".pf-c-description-list__group")
      .eq(2)
      .find(".pf-c-description-list__term")
      .should("have.text", "purge_on_delete");
    cy.get(".pf-c-description-list__group")
      .eq(2)
      .find(".pf-c-description-list__description")
      .should("have.text", "false");

    cy.get(".pf-c-description-list__group")
      .eq(3)
      .find(".pf-c-description-list__term")
      .should("have.text", "purged");
    cy.get(".pf-c-description-list__group")
      .eq(3)
      .find(".pf-c-description-list__description")
      .should("have.text", "false");

    cy.get(".pf-c-description-list__group")
      .eq(4)
      .find(".pf-c-description-list__term")
      .should("have.text", "requires");
    cy.get(".pf-c-description-list__group")
      .eq(4)
      .find(".pf-c-description-list__description")
      .should(
        "include.text",
        "frontend_model::TestResource[internal,name=default-0001]"
      );

    cy.get(".pf-c-description-list__group")
      .eq(5)
      .find(".pf-c-description-list__term")
      .should("have.text", "resources");
    cy.get(".pf-c-description-list__group")
      .eq(5)
      .find(".pf-c-description-list__description")
      .should(
        "include.text",
        '"frontend_model::TestResource[internal,name=default-0001]"'
      );

    cy.get(".pf-c-description-list__group")
      .eq(6)
      .find(".pf-c-description-list__term")
      .should("have.text", "send_event");
    cy.get(".pf-c-description-list__group")
      .eq(6)
      .find(".pf-c-description-list__description")
      .should("have.text", "false");

    cy.get(".pf-c-description-list__group")
      .eq(7)
      .find(".pf-c-description-list__term")
      .should("have.text", "service_entity");
    cy.get(".pf-c-description-list__group")
      .eq(7)
      .find(".pf-c-description-list__description")
      .should("have.text", "basic-service");
  });

  it("4.3 Delete Desired State", () => {
    cy.get('[aria-label="BreadcrumbItem"]').contains("Desired State").click();
    cy.get("tbody").eq(1).find('[aria-label="Actions"]').click();
    cy.get(".pf-c-dropdown__menu-item", { timeout: 20000 })
      .contains("Delete")
      .click();
    cy.get("#cancel").click();
    cy.get("tbody").should("have.length", 2);
    cy.get("tbody").eq(0).find('[aria-label="Actions"]').click();
    cy.get(".pf-c-dropdown__menu-item").contains("Delete").click();
    cy.get("#submit").click();
    cy.get("tbody", { timeout: 20000 }).should("have.length", 1);
  });
  it("4.4 Promote/Recompile Desired state", () => {
    cy.get("tbody").eq(0).find('[aria-label="Actions"]').click();
    cy.get(".pf-c-dropdown__menu-item")
      .contains("Promote")
      .should("have.attr", "aria-disabled", "true");
    cy.get('[aria-label="Settings actions"]').click();
    cy.get(".pf-c-tabs__link").contains("Configuration").click();
    cy.get('[aria-label="Row-auto_deploy"]').find(".pf-c-switch").click();
    cy.get('[aria-label="Row-auto_deploy"]')
      .find('[aria-label="SaveAction"]')
      .click();
    cy.get(".pf-c-nav__link").contains("Desired State").click();
    cy.get('[aria-label="RecompileButton"]').click();
    cy.get("tbody", { timeout: 20000 }).should("have.length", 2);
    cy.get("tbody")
      .eq(0)
      .find('[data-label="Status"]')
      .should("have.text", "candidate");
    cy.get("tbody").eq(0).find('[aria-label="Actions"]').click();
    cy.get(".pf-c-dropdown__menu-item").contains("Promote").click();
    cy.get("tbody")
      .eq(0)
      .find('[data-label="Status"]')
      .should("have.text", "active");
    cy.get("tbody")
      .eq(1)
      .find('[data-label="Status"]')
      .should("have.text", "retired");
    //turn the auto-deploy back to "true" and go back to desired State page
    cy.get('[aria-label="Settings actions"]').click();
    cy.get(".pf-c-tabs__link").contains("Configuration").click();
    cy.get('[aria-label="Row-auto_deploy"]').find(".pf-c-switch").click();
    cy.get('[aria-label="Row-auto_deploy"]')
      .find('[aria-label="SaveAction"]')
      .click();
    cy.get(".pf-c-nav__link").contains("Desired State").click();
  });
  it("4.5 Desired state resources", () => {
    cy.get("tbody").eq(0).find('[aria-label="Actions"]').click();
    cy.get(".pf-c-dropdown__menu-item").contains("Select for compare").click();
    cy.get("tbody").eq(1).find('[aria-label="Actions"]').click();
    cy.get(".pf-c-dropdown__menu-item")
      .contains("Compare with selected")
      .click();
    cy.get(".pf-c-title").should("have.text", "Compare");
    //go back
    cy.get(".pf-c-nav__link").contains("Desired State").click();
  });
  it("4.6 Desired state resources", () => {
    cy.get("tbody").eq(1).find('[aria-label="Actions"]').click();
    cy.get(".pf-c-dropdown__menu-item")
      .contains("Compare with current state")
      .click();
    cy.get(".pf-c-title").should("have.text", "Compliance Check");
    cy.get(".pf-c-select").eq(0).should("have.text", "No dry runs exist");
    cy.get(".pf-c-button").contains("Perform dry run").click();
    cy.get('[aria-label="DiffItemList"]', { timeout: 20000 }).should(
      "be.visible"
    );
  });
});
