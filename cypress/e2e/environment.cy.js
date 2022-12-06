const icon = "./cypress/fixtures/test-icon.png";

/// <reference types="Cypress" />
const configurationTypes = [
  {
    name: "agent_trigger_method_on_auto_deploy",
    row: '[aria-label="Row-agent_trigger_method_on_auto_deploy"]',
    inputType: "select",
    newValue: "push_full_deploy",
  },
  {
    name: "auto_deploy",
    row: '[aria-label="Row-auto_deploy"]',
    inputType: "switch",
    newValue: "false",
  },
  {
    name: "auto_full_compile",
    row: '[aria-label="Row-auto_full_compile"]',
    inputType: "text",
    newValue: "1 2 3 4 5",
  },
  {
    name: "autostart_agent_deploy_interval",
    row: '[aria-label="Row-autostart_agent_deploy_interval"]',
    inputType: "textNumber",
    newValue: "610",
  },
  {
    name: "autostart_agent_deploy_splay_time",
    row: '[aria-label="Row-autostart_agent_deploy_splay_time"]',
    inputType: "textNumber",
    newValue: "20",
  },
  {
    name: "autostart_agent_interval",
    row: '[aria-label="Row-autostart_agent_interval"]',
    inputType: "textNumber",
    newValue: "610",
  },
  {
    name: "autostart_agent_map",
    row: '[aria-label="Row-autostart_agent_map"]',
    inputType: "textmap",
    newValue: "new value",
  },

  {
    name: "autostart_agent_repair_interval",
    row: '[aria-label="Row-autostart_agent_repair_interval"]',
    inputType: "textNumber",
    newValue: "86410",
  },
  {
    name: "autostart_agent_repair_splay_time",
    row: '[aria-label="Row-autostart_agent_repair_splay_time"]',
    inputType: "textNumber",
    newValue: "610",
  },
  {
    name: "autostart_on_start",
    row: '[aria-label="Row-autostart_on_start"]',
    inputType: "switch",
    newValue: "false",
  },
  {
    name: "autostart_splay",
    row: '[aria-label="Row-autostart_splay"]',
    inputType: "textNumber",
    newValue: "20",
  },
  {
    name: "available_versions_to_keep",
    row: '[aria-label="Row-available_versions_to_keep"]',
    inputType: "textNumber",
    newValue: "110",
  },
  {
    name: "environment_agent_trigger_method",
    row: '[aria-label="Row-environment_agent_trigger_method"]',
    inputType: "select",
    newValue: "push_incremental_deploy",
  },
  {
    name: "lsm_partial_compile",
    row: '[aria-label="Row-lsm_partial_compile"]',
    inputType: "switch",
    newValue: "true",
  },
  {
    name: "notification_retention",
    row: '[aria-label="Row-notification_retention"]',
    inputType: "textNumber",
    newValue: "375",
  },
  {
    name: "protected_environment",
    row: '[aria-label="Row-protected_environment"]',
    inputType: "switch",
    newValue: "true",
  },
  {
    name: "purge_on_delete",
    row: '[aria-label="Row-purge_on_delete"]',
    inputType: "switch",
    newValue: "true",
  },
  {
    name: "push_on_auto_deploy",
    row: '[aria-label="Row-push_on_auto_deploy"]',
    inputType: "switch",
    newValue: "false",
  },
  {
    name: "resource_action_logs_retention",
    row: '[aria-label="Row-resource_action_logs_retention"]',
    inputType: "textNumber",
    newValue: "8",
  },
  {
    name: "server_compile",
    row: '[aria-label="Row-server_compile"]',
    inputType: "switch",
    newValue: "false",
  },
];
const testProjectName = (number) => "Test Project Name " + number;
const testName = (number) => "TestName " + number;

beforeEach(() => {
  // delete project exlcuding test one before each test
  cy.request("http://localhost:8010/proxy/api/v1/project").as("projects");
  cy.get("@projects").then((response) => {
    response.body.projects.map((project) => {
      if (project.name !== "lsm-frontend") {
        cy.request(
          "DELETE",
          `http://localhost:8010/proxy/api/v1/project/${project.id}`
        );
      }
    });
  });
});
const createEnv = ({
  envName,
  projectName,
  shouldPassEnvName = true,
  fillOptionalInputs = false,
}) => {
  cy.get('[aria-label="Project Name-typeahead"]').type(projectName);
  cy.get('[aria-label="Project Name-select-input').within(() => {
    cy.get(".pf-c-select__menu-item").click();
  });
  if (shouldPassEnvName) {
    cy.get('[aria-label="Name-input"]').type(envName);
  }
  if (!fillOptionalInputs) {
    cy.get('[aria-label="Description-input"]').type("Test description");
    cy.get('[aria-label="Repository-input"]').type("repository");
    cy.get('[aria-label="Branch-input"]').type("branch");
    cy.get("#simple-text-file-filename").selectFile(icon, {
      action: "drag-drop",
      force: true,
    });
  }
};

const deleteEnv = (name, projectName) => {
  cy.get("button").contains("Delete environment").click();
  cy.get('[aria-label="delete"]').should("be.disabled");

  cy.get('[aria-label="delete environment check"]').type(name);
  cy.get('[aria-label="delete"]').should("not.be.disabled").click();
  cy.url().should("eq", Cypress.config().baseUrl + "/console/");
  cy.get('[aria-label="Environment card"]')
    .contains(projectName)
    .should("not.exist");
};

const openSettings = (envName) => {
  cy.get('[aria-label="Settings actions"]').click();
  cy.url().should("contain", "/console/settings?env=");
  cy.get('[aria-label="Name-value"]').should("contain", envName);
};

describe("Environment", function () {
  it("1.1 cancel creation of an environment", function () {
    cy.visit("/console/");
    cy.get('[aria-label="Overview-Success"] > :first-child').click();
    cy.url().should(
      "eq",
      Cypress.config().baseUrl + "/console/environment/create"
    );
    createEnv({
      envName: testName(1),
      projectName: testProjectName(1),
    });
    cy.get("button").contains("Cancel").click();
    cy.url().should("eq", Cypress.config().baseUrl + "/console/");
  });

  it("1.2 Create new  environment", function () {
    //fill the form and submit
    cy.visit("/console/environment/create");
    createEnv({
      envName: testName(2),
      projectName: testProjectName(2),
      shouldPassEnvName: false,
    });
    cy.get("button").contains("Submit").should("be.disabled");
    cy.get('[aria-label="Name-input"]').type(testName(2));
    cy.get("button").contains("Submit").should("not.be.disabled");
    cy.get("button").contains("Submit").click();
    cy.url().should("contain", "/console/lsm/catalog?env=");
    //go back to gome and check if env is visible
    cy.wait(50);
    cy.get(".pf-c-breadcrumb__item")
      .contains("Home")
      .should("be.visible")
      .click();
    cy.url().should("eq", Cypress.config().baseUrl + "/console/");
    cy.get('[aria-label="Environment card"]').should(
      "any.contain",
      testName(2)
    );
  });

  it("1.3 delete an environment", function () {
    //Fill The form and submit
    cy.visit("/console/environment/create");
    createEnv({
      envName: testName(3),
      projectName: testProjectName(3),
      shouldPassEnvName: true,
      fillOptionalInputs: true,
    });
    cy.get("button").contains("Submit").click();
    cy.url().should("contain", "/console/lsm/catalog?env=");

    openSettings(testName(3));
    deleteEnv(testName(3), testProjectName(3));
  });

  it("1.4 Edit created environment", function () {
    //Fill The form and submit
    cy.visit("/console/environment/create");
    createEnv({
      envName: testName(4),
      projectName: testProjectName(4),
      shouldPassEnvName: true,
      fillOptionalInputs: true,
    });
    cy.get("button").contains("Submit").click();

    openSettings(testName(4));
    //change Name value
    cy.wait(50);
    cy.get('[aria-label="Name-toggle-edit"]').click();
    cy.get('[aria-label="Name-input"]').clear().type("New Value Name");
    cy.get('[aria-label="Name-submit-edit"]').click();
    cy.get('[aria-label="Name-value"]').should("contain", "New Value Name");
    //change Description value
    cy.wait(50);
    cy.get('[aria-label="Description-toggle-edit"]').click();
    cy.get('[aria-label="Description-input"]')
      .clear()
      .type("New Value Description");
    cy.get('[aria-label="Description-submit-edit"]').click();
    cy.get('[aria-label="Description-value"]').should(
      "contain",
      "New Value Description"
    );
    //change Repository Branch value
    cy.wait(50);
    cy.get('[aria-label="Repository Settings-toggle-edit"]')
      .should("be.visible")
      .click();
    cy.get('[aria-label="repo_branch-input"]')
      .clear()
      .type("New Value Repo Branch");
    cy.get('[aria-label="Repository Settings-submit-edit"]').click();
    cy.get('[aria-label="repo_branch-value"]').should(
      "contain",
      "New Value Repo Branch"
    );
    //change Repository url value
    cy.wait(50);
    cy.get('[aria-label="Repository Settings-toggle-edit"]')
      .should("be.visible")
      .click();
    cy.get('[aria-label="repo_url-input"]').clear().type("New Value Repo Url");
    cy.get('[aria-label="Repository Settings-submit-edit"]').click();
    cy.get('[aria-label="repo_url-value"]').should(
      "contain",
      "New Value Repo Url"
    );
    //change Project Name value
    cy.wait(50);
    cy.get('[aria-label="Project Name-toggle-edit"]').click();
    cy.get('[aria-label="Project Name-typeahead"]')
      .clear()
      .type("New Value Project Name");

    cy.get("button").contains('Create "New Value Project Name"').click();
    cy.get('[aria-label="Project Name-submit-edit"]').click({ force: true });
    //change Icon value
    cy.wait(50);
    cy.get('[aria-label="Icon-toggle-edit"]').should("be.visible").click();
    cy.get("#simple-text-file-filename").selectFile(icon, {
      action: "drag-drop",
      force: true,
    });
    cy.get('[aria-label="Icon-submit-edit"]').click();

    cy.get('[aria-label="Icon-value"]').should("not.have.text", "no icon");
  });

  it("1.5 Clear environment", function () {
    //Fill The form and submit
    cy.visit("/console/");
    cy.get('[aria-label="Environment card"]').contains("test").click();
    cy.get('[aria-label="ServiceCatalog-Success"]').should("to.be.visible");

    //Go to settings
    openSettings("test");

    //Cancel Clear Env and expect nothing to change
    cy.get("button").contains("Clear environment").click();
    cy.get("button").contains("Cancel").click();
    cy.visit("/console/");
    cy.get('[aria-label="Environment card"]').contains("test").click();
    cy.get('[aria-label="ServiceCatalog-Success"]').should("to.be.visible");

    //Go to settings and get Id of an environment
    openSettings("test");

    //Clear Env
    cy.get("button").contains("Clear environment").click();
    cy.get('[aria-label="clear environment check"]').type("test");
    cy.get("button")
      .contains("I understand the consequences, clear this environment")
      .click();
    cy.visit("/console/");
    cy.get('[aria-label="Environment card"]').contains("test").click();
    cy.get('[aria-label="ServiceCatalog-Empty"]').should("to.be.visible");
    //Update service catalog to restore instances
    cy.get("button").contains("Update Service Catalog").click();
    cy.get("button").contains("Yes").click();
    // exceeded timeout needed is to await continous call to return services
    cy.get('[aria-label="ServiceCatalog-Success"]', { timeout: 30000 }).should(
      "to.be.visible"
    );
  });

  it("1.6 Edit environment configuration", function () {
    cy.visit("/console/environment/create");
    createEnv({
      envName: testName(6),
      projectName: testProjectName(6),
      shouldPassEnvName: true,
      fillOptionalInputs: true,
    });
    cy.get("button").contains("Submit").click();
    cy.url().should("contain", "/console/lsm/catalog?env=");

    openSettings(testName(6), testProjectName(6));
    cy.get("button").contains("Configuration").click();
    //go through every configuration and
    cy.wrap(configurationTypes).each((config) => {
      switch (config.inputType) {
        case "text":
          cy.get(config.row).clear().type(config.newValue);
          break;
        case "textNumber":
          cy.get(config.row).within(() => {
            cy.get(".pf-c-form-control").clear().type(config.newValue);
          });
          break;
        case "switch":
          cy.get(config.row).within(() => {
            cy.get(".pf-c-switch").click();
          });

          break;
        case "select":
          cy.get(config.row).click();
          cy.get(".pf-c-select__menu-item").contains(config.newValue).click();

          break;
        case "textmap":
          cy.get(config.row).within(() => {
            cy.get('[aria-label="editEntryValue"]')
              .filter((key, $el) => {
                return $el.value === "local:";
              })
              .clear()
              .type(config.newValue);
          });
          break;
      }
      cy.wait(100);
      cy.get('[aria-label="Warning"]').should("exist");
      cy.get(config.row).within(() => {
        cy.get('[aria-label="SaveAction"]').click();
      });
      cy.wait(100);
      cy.get('[aria-label="Warning"]').should("not.exist");
      switch (config.inputType) {
        case "textNumber" | "text":
          cy.get(config.row).within(() => {
            cy.get(".pf-c-form-control").should("have.text", config.newValue);
          });
          break;
        case "select":
          cy.get(config.row).within(() => {
            cy.get(".pf-c-form-control").should("have.value", config.newValue);
          });

          break;
        case "textmap":
          cy.get(config.row).within(() => {
            cy.get('[aria-label="editEntryValue"]').should(
              "have.value",
              config.newValue
            );
          });
          break;
      }
    });
    //unable to delete env
    cy.get('[aria-label="Row-protected_environment"]').within(() => {
      cy.get(".pf-c-switch").click();
    });
    cy.get('[aria-label="Warning"]').should("exist");
    cy.get('[aria-label="Row-protected_environment"]').within(() => {
      cy.get('[aria-label="SaveAction"]').click();
    });
    cy.get('[aria-label="Warning"]').should("not.exist");

    cy.get("button").contains("Environment").click();
    deleteEnv(testName(6), testProjectName(6));
  });
});
