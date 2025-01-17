const testProjectName = (id) => "Test Project Name " + id;
const testName = (id) => "TestName " + id;

beforeEach(() => {
  cy.fixture("test-icon.png", { encoding: null }).as("icon");
  cy.intercept("POST", "/api/v2/environment_settings/**").as(
    "postEnvConfigEdit",
  );

  // delete projects excluding test one before each test to have unified conditions for each test case
  cy.intercept("/api/v2/environment").as("createEnv");
  cy.request("/api/v1/project").as("projects");
  cy.get("@projects").then((response) => {
    response.body.projects.map((project) => {
      if (!/frontend/.test(project.name)) {
        cy.request("DELETE", `api/v1/project/${project.id}`);
      }
    });
  });
});

/**
 * Function is responsible for creating Environment process without submitting it.
 * it accepts object that holds:
 *
 * @param {*} envName -string
 * @param {*} projectName -string
 * @param {*} shouldPassEnvName -boolean - default value - true
 * @param {*} fillOptionalInputs -boolean - default value - false
 */
const fillCreateEnvForm = ({
  envName,
  projectName,
  shouldPassEnvName = true,
  fillOptionalInputs = false,
}) => {
  cy.get('[aria-label="Project Name-select-toggleFilterInput"]').type(
    projectName,
  );
  cy.get('[role="option"]').contains(projectName).click();
  if (shouldPassEnvName) {
    cy.get('[aria-label="Name-input"]').type(envName);
  }
  if (!fillOptionalInputs) {
    cy.get('[aria-label="Description-input"]').type("Test description");
    cy.get('[aria-label="Repository-input"]').type("repository");
    cy.get('[aria-label="Branch-input"]').type("branch");
    cy.get("#file-upload-filename").selectFile(
      {
        contents: "@icon",
        fileName: "icon.png",
        mimeType: "image/png",
      },
      {
        action: "drag-drop",
        force: true,
      },
    );
  }
};

/**
 * Function is responsible for going through delete Environment process with assertions selection that covers test cases
 * @param {*} name - string
 */
const deleteEnv = (name) => {
  cy.get("button").contains("Delete environment").click();
  cy.get('[aria-label="delete"]').should("be.disabled");

  cy.get('[aria-label="delete environment check"]').type(name);
  cy.get('[aria-label="delete"]').click();
  cy.url().should("eq", Cypress.config().baseUrl + "/console");

  cy.get(`[aria-label="Select-environment-${name}"]`).should("not.exist");
};

/**
 * Function handle going into Settings tab, and checks if we chosen correct environment
 * @param {*} envName - string
 */
const openSettings = (envName) => {
  cy.wait(2000);

  cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Settings").click();
  cy.url().should("contain", "/console/settings?env=");
  cy.get('[aria-label="Name-value"]').should("contain", envName);
};

describe("Environment", () => {
  it("1.1 cancel creation of an environment", function () {
    cy.visit("/console/");
    cy.get('[aria-label="Overview-Success"] > :first-child').click();
    cy.url().should(
      "eq",
      Cypress.config().baseUrl + "/console/environment/create",
    );
    fillCreateEnvForm({
      envName: testName(1),
      projectName: testProjectName(1),
    });
    cy.get("button").contains("Cancel").click();
    cy.url().should("eq", Cypress.config().baseUrl + "/console");
  });

  it("1.2 Create new  environment", function () {
    cy.intercept("/lsm/v1/service_catalog?instance_summary=True").as(
      "getCatalog",
    );

    //fill the form and submit
    cy.visit("/console/environment/create");
    fillCreateEnvForm({
      envName: testName(2),
      projectName: testProjectName(2),
      shouldPassEnvName: false,
    });

    cy.get('[aria-label="submit"]').should("be.disabled");
    cy.get('[aria-label="Name-input"]').type(testName(2));

    cy.get("button").contains("Submit").click();
    cy.wait(1000);
    // test to check redirection to right page. OSS it should be the Desired state page instead of the service catalog.
    if (Cypress.env("edition") === "iso") {
      cy.get("h1").contains("Service Catalog").should("to.be.visible");
    } else {
      cy.get("h1").contains("Desired State").should("to.be.visible");
    }

    // go back to home and check if env is visible
    cy.get('[aria-label="BreadcrumbItem"]').contains("Home").click();

    cy.get(`[aria-label="Select-environment-${testName(2)}"]`).click();

    openSettings(testName(2));
    deleteEnv(testName(2), testProjectName(2));
  });

  it("1.4 Edit created environment", function () {
    //Fill The form and submit
    cy.visit("/console/environment/create");
    fillCreateEnvForm({
      envName: testName(3),
      projectName: testProjectName(3),
      shouldPassEnvName: true,
      fillOptionalInputs: true,
    });

    cy.get("button").contains("Submit").click();

    // ISO specific assertion
    if (Cypress.env("edition") === "iso") {
      cy.url().should("contain", "/console/lsm/catalog?env=", {
        timeout: 10000,
      });
    }

    openSettings(testName(3));

    //change Name value
    cy.get('[aria-label="Name-toggle-edit"]').click();
    cy.get('[aria-label="Name-input"]').clear();
    cy.get('[aria-label="Name-input"]').type("New Value Name");
    cy.get('[aria-label="Name-submit-edit"]').click();
    cy.get('[aria-label="Name-value"]').should("contain", "New Value Name");

    //change Description value
    cy.wait(1000);
    cy.get('[aria-label="Description-toggle-edit"]:enabled').click();
    cy.get('[aria-label="Description-input"]').clear();
    cy.get('[aria-label="Description-input"]').type("New Value Description");
    cy.get('[aria-label="Description-submit-edit"]').click();
    cy.get('[aria-label="Description-value"]').should(
      "contain",
      "New Value Description",
    );

    //change Repository Branch value
    cy.wait(1000);
    cy.get('[aria-label="Repository Settings-toggle-edit"]:enabled').click();

    //delay is needed to fix error that says that this input is disabled
    cy.get('[aria-label="repo_branch-input"]').type("New Value Repo Branch");
    cy.get('[aria-label="Repository Settings-submit-edit"]:enabled').click();
    cy.get('[aria-label="repo_branch-value"]').should(
      "contain",
      "New Value Repo Branch",
    );

    //change Repository url value
    cy.wait(1000);
    cy.get('[aria-label="Repository Settings-toggle-edit"]:enabled').click();

    //delay is needed to fix error that says that this input is disabled
    cy.get('[aria-label="repo_url-input"]').type("New Value Repo Url", {
      delay: 10,
    });
    cy.get('[aria-label="Repository Settings-submit-edit"]:enabled').click();
    cy.get('[aria-label="repo_url-value"]').should(
      "contain",
      "New Value Repo Url",
    );

    //change Project Name value
    cy.wait(1000);
    cy.get('[aria-label="Project Name-toggle-edit"]:enabled').click();
    cy.get('[aria-label="Project Name-select-toggleFilterInput"]').clear();
    cy.get('[aria-label="Project Name-select-toggleFilterInput"]').type(
      "New Value Project Name",
    );

    cy.get("button").contains('Create "New Value Project Name"').click();
    cy.get('[aria-label="Project Name-submit-edit"]').click();

    openSettings("New Value Name");
    deleteEnv("New Value Name", testProjectName(3));
  });

  // specific to ISO
  if (Cypress.env("edition") === "iso") {
    it("1.5 Clear environment", function () {
      // Fill The form and submit
      cy.visit("/console/");
      cy.get(`[aria-label="Select-environment-test"]`).click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]')
        .contains("Service Catalog")
        .click();
      cy.get('[aria-label="ServiceCatalog-Empty"]', {
        timeout: 10000,
      }).should("to.be.visible");

      // Go to settings
      openSettings("test");

      // Cancel Clear Env and expect nothing to change
      cy.get("button").contains("Clear environment").click();
      cy.get("button").contains("Cancel").click();
      cy.visit("/console/");
      cy.get(`[aria-label="Select-environment-test"]`).click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]')
        .contains("Service Catalog")
        .click();

      cy.get('[aria-label="ServiceCatalog-Empty"]', {
        timeout: 10000,
      }).should("to.be.visible");

      // Go to settings and get Id of an environment
      openSettings("test");

      // Clear Env
      cy.get("button").contains("Clear environment").click();
      cy.get('[aria-label="clear environment check"]').type("test");
      cy.get("button")
        .contains("I understand the consequences, clear this environment")
        .click();
      cy.visit("/console/");
      cy.get(`[aria-label="Select-environment-test"]`).click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]')
        .contains("Service Catalog")
        .click();
      cy.get('[aria-label="ServiceCatalog-Empty"]').should("to.be.visible");

      cy.get("button").contains("Update Service Catalog").click();
      //Update service catalog to restore instances
      cy.get("button", { timeout: 30000 }).contains("Yes").click();
      // exceeded timeout needed is to await continuous call to return services
      cy.get('[aria-label="ServiceCatalog-Success"]', {
        timeout: 30000,
      }).should("to.be.visible");
    });
  }

  xit("1.6 Edit environment configuration", function () {
    cy.visit("/console/environment/create");
    fillCreateEnvForm({
      envName: testName(6),
      projectName: testProjectName(6),
      shouldPassEnvName: true,
      fillOptionalInputs: true,
    });
    cy.get("button").contains("Submit").trigger("click");

    // specific to ISO
    if (Cypress.env("edition") === "iso") {
      cy.url().should("contain", "/console/lsm/catalog?env=", {
        timeout: 10000,
      });
    }

    openSettings(testName(6), testProjectName(6));
    cy.get("button").contains("Configuration").click();

    //Change auto_deploy
    cy.get('[aria-label="Row-auto_deploy"]').find(".pf-v6-c-switch").click();
    cy.get('[data-testid="Warning"]').should("exist");
    cy.get('[aria-label="Row-auto_deploy"]')
      .find('[aria-label="SaveAction"]')
      .click();
    cy.get('[data-testid="Warning"]').should("not.exist");

    //Change auto_full_compile
    cy.get('[aria-label="Row-auto_full_compile"]').clear();
    cy.get('[aria-label="Row-auto_full_compile"]').type("1 2 3 4 5");
    cy.get('[data-testid="Warning"]').should("exist");
    cy.get('[aria-label="Row-auto_full_compile"]')
      .find('[aria-label="SaveAction"]')
      .click();
    cy.get('[data-testid="Warning"]').should("not.exist");
    cy.get('[aria-label="Row-auto_full_compile"]')
      .find(".pf-v6-c-form-control input")
      .should("have.value", "1 2 3 4 5");

    //Change autostart_agent_deploy_interval
    cy.get('[aria-label="Row-autostart_agent_deploy_interval"]')
      .find(".pf-v6-c-form-control")
      .type("{selectAll}610");
    cy.get('[data-testid="Warning"]').should("exist");
    cy.get('[aria-label="Row-autostart_agent_deploy_interval"]')
      .find('[aria-label="SaveAction"]')
      .click();
    cy.get('[data-testid="Warning"]').should("not.exist");
    cy.get('[aria-label="Row-autostart_agent_deploy_interval"]')
      .find(".pf-v6-c-form-control input")
      .should("have.value", "610");

    //Change autostart_agent_repair_interval
    cy.get('[aria-label="Row-autostart_agent_repair_interval"]')
      .find(".pf-v6-c-form-control")
      .type("{selectAll}86410");
    cy.get('[data-testid="Warning"]').should("exist");
    cy.get('[aria-label="Row-autostart_agent_repair_interval"]')
      .find('[aria-label="SaveAction"]')
      .click();
    cy.get('[data-testid="Warning"]').should("not.exist");
    cy.get('[aria-label="Row-autostart_agent_repair_interval"]')
      .find(".pf-v6-c-form-control input")
      .should("have.value", "86410");

    //Change autostart_on_start
    cy.get('[aria-label="Row-autostart_on_start"]')
      .find(".pf-v6-c-switch")
      .click();
    cy.get('[data-testid="Warning"]').should("exist");
    cy.get('[aria-label="Row-autostart_on_start"]')
      .find('[aria-label="SaveAction"]')
      .click();
    cy.get('[data-testid="Warning"]').should("not.exist");

    //Change available_versions_to_keep
    cy.get('[aria-label="Row-available_versions_to_keep"]')
      .find(".pf-v6-c-form-control")
      .type("{selectAll}110");
    cy.get('[data-testid="Warning"]').should("exist");
    cy.get('[aria-label="Row-available_versions_to_keep"]')
      .find('[aria-label="SaveAction"]')
      .click();
    cy.get('[data-testid="Warning"]').should("not.exist");
    cy.get('[aria-label="Row-available_versions_to_keep"]')
      .find(".pf-v6-c-form-control input")
      .should("have.value", "110");

    // specific to ISO
    if (Cypress.env("edition") === "iso") {
      // Change lsm_partial_compile
      cy.get('[aria-label="Row-lsm_partial_compile"]')
        .find(".pf-v6-c-switch")
        .click();

      cy.get('[data-testid="Warning"]').should("exist");
      cy.get('[aria-label="Row-lsm_partial_compile"]')
        .find('[aria-label="SaveAction"]')
        .click();
      cy.get('[data-testid="Warning"]').should("not.exist");
    }

    //change notification_retention
    cy.get('[aria-label="Row-notification_retention"]')
      .find(".pf-v6-c-form-control")
      .type("{selectAll}375");
    cy.get('[data-testid="Warning"]').should("exist");
    cy.get('[aria-label="Row-notification_retention"]')
      .find('[aria-label="SaveAction"]')
      .click();
    cy.get('[data-testid="Warning"]').should("not.exist");
    cy.get('[aria-label="Row-notification_retention"]')
      .find(".pf-v6-c-form-control input")
      .should("have.value", "375");

    //Change protected_environment
    cy.get('[aria-label="Row-protected_environment"]')
      .find(".pf-v6-c-switch")
      .click();
    cy.get('[data-testid="Warning"]').should("exist");
    cy.get('[aria-label="Row-protected_environment"]')
      .find('[aria-label="SaveAction"]')
      .click();
    cy.get('[data-testid="Warning"]').should("not.exist");

    //Change resource_action_logs_retention
    cy.get('[aria-label="Row-resource_action_logs_retention"]')
      .find(".pf-v6-c-form-control")
      .type("{selectAll}8");
    cy.get('[data-testid="Warning"]').should("exist");
    cy.get('[aria-label="Row-resource_action_logs_retention"]')
      .find('[aria-label="SaveAction"]')
      .click();
    cy.get('[data-testid="Warning"]').should("not.exist");
    cy.get('[aria-label="Row-resource_action_logs_retention"]')
      .find(".pf-v6-c-form-control input")
      .should("have.value", "8");

    //change server_compile
    cy.get('[aria-label="Row-server_compile"]').find(".pf-v6-c-switch").click();
    cy.get('[data-testid="Warning"]').should("exist");
    cy.get('[aria-label="Row-server_compile"]')
      .find('[aria-label="SaveAction"]')
      .click();
    cy.get('[data-testid="Warning"]').should("not.exist");

    //re-enable to delete env
    cy.get('[aria-label="Row-protected_environment"]')
      .find(".pf-v6-c-switch")
      .click();
    cy.get('[data-testid="Warning"]').should("exist");
    cy.get('[aria-label="Row-protected_environment"]')
      .find('[aria-label="SaveAction"]')
      .click();
    cy.get('[data-testid="Warning"]').should("not.exist");

    cy.get(".pf-v6-c-tabs__list")
      .find("button")
      .contains("Environment")
      .click();
    deleteEnv(testName(6), testProjectName(6));
  });
});
