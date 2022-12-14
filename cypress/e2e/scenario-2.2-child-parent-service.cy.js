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
 * when ID of the environment is not yet known, use this method to wait for the compile to be terminated.
 */
const waitForCompile = () => {
  cy.url().then((url) => {
    const location = new URL(url);
    const id = location.searchParams.get("env");
    checkStatusCompile(id);
  });
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

describe("Scenario 2.2 Service Catalog - Parent/Children Service", () => {
  it("2.2.1 Add Instance on parent-service", () => {
    cy.visit("/console/");
    cy.get('[aria-label="Environment card"]').contains("lsm-frontend").click();
    cy.get("#parent-service").contains("Show inventory").click();
    cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");
    // Add an instance and fill form
    cy.get("#add-instance-button").click();
    cy.get("#service_id").type("0001");
    cy.get("#name").type("parent");
    cy.get("button").contains("Confirm").click();

    // Should show the ServiceInventory-Success Component.
    cy.get('[aria-label="ServiceInventory-Success"]').should("to.be.visible");
    // Check if only one row has been added to the table.
    cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);

    // open row from element
    cy.get("#expand-toggle0").click();

    // Go to ressource tab expect it be empty
    cy.get(".pf-c-tabs__item-text").contains("Resources").click();
    cy.get('[aria-label="ResourceTable-Empty"]').should("to.be.visible");

    cy.intercept("**/resources**").as("GetVersion");

    // 4 compiles are being triggered for this instance.
    waitForCompile();
    waitForCompile();
    waitForCompile();
    waitForCompile();
    cy.wait("@GetVersion", { timeout: 10000 });
    cy.wait(2000);

    // expect one item with deployed state
    cy.get('[aria-label="ResourceTable-Success"]').should(($table) => {
      expect($table).to.have.length(1);

      const $td = $table.find("td");
      // there can only be 2 table-data cells available
      expect($td).to.have.length(2);
      expect($td.eq(0), "first item").to.have.text(
        "frontend_model::TestResource[internal,name=default-0001]"
      );
      expect($td.eq(1), "second item").to.have.text("deployed");
    });

    // click on service catalog in breadcrumb
    cy.get('[aria-label="BreadcrumbItem"]').contains("Service Catalog").click();

    // click show inventory on child-service
    cy.get("#child-service").contains("Show inventory").click();
    cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");
    // Add an instance and fill form
    cy.get("#add-instance-button").click();
    cy.get("#service_id").type("0002");
    cy.get("#name").type("child");
    cy.get(".pf-c-select").click();
    cy.get('[aria-label="parent_entity-select-input"]').first().click();
    cy.get("button").contains("Confirm").click();
    // Expect to be redirected to service inventory
    cy.get('[aria-label="ServiceInventory-Success"]').should("to.be.visible");

    waitForCompile();
    // Check if only one row has been added to the table.
    cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);
  });
  it("2.2.2 Remove Parent Service and Child Service", () => {
    cy.visit("/console/");

    cy.intercept("DELETE", "/lsm/v1/service_inventory/child-service/**").as(
      "DeleteChildService"
    );
    cy.intercept("DELETE", "/lsm/v1/service_inventory/parent-service/**").as(
      "DeleteParentService"
    );
    cy.intercept(
      "GET",
      "/lsm/v1/service_inventory/parent-service?include_deployment_progress=True&limit=20&&sort=created_at.desc"
    ).as("GetParentInventory");

    cy.get('[aria-label="Environment card"]').contains("lsm-frontend").click();
    cy.get("#parent-service").contains("Show inventory").click();

    waitForCompile();

    // open row from element
    cy.get("#expand-toggle0").click();
    // try delete item (Should not be possible)
    cy.get(".pf-c-description-list").contains("Delete").click();
    cy.get(".pf-c-modal-box__title-text").should("contain", "Delete instance");
    cy.get(".pf-c-form__actions").contains("Yes").click();

    // check status change before compile
    cy.wait("@DeleteParentService");

    cy.get('[aria-label="InstanceRow-Intro"]:first')
      .find('[data-label="State"]')
      .should("contain", "delete_validating_up");

    // check status change after compile, should be up again because the deletion couldn't be completed
    waitForCompile();
    cy.wait("@GetParentInventory");
    cy.wait(10000);

    cy.get('[aria-label="InstanceRow-Intro"]:first')
      .find('[data-label="State"]')
      .should("not.contain", "delete_validating_up");

    // click on service catalog in breadcrumb
    cy.get('[aria-label="BreadcrumbItem"]').contains("Service Catalog").click();

    cy.get("#child-service").contains("Show inventory").click();

    // open row from element
    cy.get("#expand-toggle0").click();

    // try delete item (Should be possible)
    cy.get(".pf-c-description-list").contains("Delete").click();
    cy.get(".pf-c-modal-box__title-text").should("contain", "Delete instance");
    cy.get(".pf-c-form__actions").contains("Yes").click();

    cy.wait("@DeleteChildService").its("response.statusCode").should("eq", 200);

    cy.wait(10000);
    waitForCompile();
    cy.wait("@GetParentInventory");

    cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");
  });
});
