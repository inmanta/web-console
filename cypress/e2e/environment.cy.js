const icon = "./cypress/fixtures/test-icon.png";

/// <reference types="Cypress" />
const PATHS = {
  catalogPage: "/console/lsm/catalog?env=",
  createEnvPage: "/console/environment/create",
  settingsPage: "/console/settings?env=",
};
const parameterTypes = [
  { name: "Project Name", type: "typeahead" },
  { name: "Name", type: "text" },
  { name: "Description", type: "text" },
  { name: "Repository", type: "joined" },
  { name: "Branch", type: "joined" },
  { name: "Icon", type: "icon" },
];
const configurationTypes = [
  {
    name: "agent_trigger_method_on_auto_deploy",
    row: "Row-agent_trigger_method_on_auto_deploy > td > input",
    inputType: "select",
    newValue: "push_full_deploy",
  },
  {
    name: "auto_deploy",
    row: "Row-auto_deploy > td > input",
    inputType: "switch",
    newValue: "false",
  },
  {
    name: "auto_full_compile",
    row: "Row-auto_full_compile > td > input",
    inputType: "text",
    newValue: "test Value",
  },
  {
    name: "autostart_agent_deploy_interval",
    row: "Row-autostart_agent_deploy_interval > td > input",
    inputType: "text",
    newValue: "610",
  },
  {
    name: "autostart_agent_deploy_splay_time",
    row: "Row-autostart_agent_deploy_splay_time > td > input",
    inputType: "text",
    newValue: "20",
  },
  {
    name: "autostart_agent_interval",
    row: "Row-autostart_agent_interval > td > input",
    inputType: "text",
    newValue: "610",
  },
  {
    name: "autostart_agent_map",
    row: "Row-autostart_agent_map > td > input",
    inputType: "textmap",
    newValue: "",
  },

  {
    name: "autostart_agent_repair_interval",
    row: "Row-autostart_agent_repair_interval > td > input",
    inputType: "text",
    newValue: "86410",
  },
  {
    name: "autostart_agent_repair_splay_time",
    row: "Row-autostart_agent_repair_splay_time > td > input",
    inputType: "text",
    newValue: "610",
  },
  {
    name: "autostart_on_start",
    row: "Row-autostart_on_start > td > input",
    inputType: "switch",
    newValue: "false",
  },
  {
    name: "autostart_splay",
    row: "Row-autostart_splay > td > input",
    inputType: "text",
    newValue: "20",
  },
  {
    name: "available_versions_to_keep",
    row: "Row-available_versions_to_keep > td > input",
    inputType: "text",
    newValue: "110",
  },
  {
    name: "environment_agent_trigger_method",
    row: "Row-environment_agent_trigger_method > td > input",
    inputType: "select",
    newValue: "push_incremental_deploy",
  },
  {
    name: "lsm_partial_compile",
    row: "Row-lsm_partial_compile > td > input",
    inputType: "switch",
    newValue: "true",
  },
  {
    name: "notification_retention",
    row: "Row-notification_retention > td > input",
    inputType: "text",
    newValue: "375",
  },
  {
    name: "protected_environment",
    row: "Row-protected_environment > td > input",
    inputType: "switch",
    newValue: "true",
  },
  {
    name: "purge_on_delete",
    row: "Row-purge_on_delete > td > input",
    inputType: "switch",
    newValue: "true",
  },
  {
    name: "push_on_auto_deploy",
    row: "Row-push_on_auto_deploy > td > input",
    inputType: "switch",
    newValue: "false",
  },
  {
    name: "resource_action_logs_retention",
    row: "Row-resource_action_logs_retention > td > input",
    inputType: "text",
    newValue: "8",
  },
  {
    name: "server_compile",
    row: "Row-server_compile > td > input",
    inputType: "switch",
    newValue: "false",
  },
];
const newEnvCard = '[aria-label="Overview-Success"] > :first-child';
const projectNameInput = '[aria-label="Project Name-typeahead"]';
const newProjectName = '[aria-label="Project Name-select-input';
const newProjectNameButton = ".pf-c-select__menu-item";
const nameInput = '[aria-label="Name-input"]';
const descInput = '[aria-label="Description-input"]';
const repoInput = '[aria-label="Repository-input"]';
const branchInput = '[aria-label="Branch-input"]';
const iconInput = "#simple-text-file-filename";

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
        ).as("projects");
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
  cy.get(projectNameInput).type(projectName);
  cy.get(newProjectName).within(() => {
    cy.get(newProjectNameButton).click();
  });
  if (shouldPassEnvName) {
    cy.get(nameInput).type(envName);
  }
  if (!fillOptionalInputs) {
    cy.get(descInput).type("Test description");
    cy.get(repoInput).type("repository");
    cy.get(branchInput).type("branch");
    cy.get(iconInput).selectFile(icon, { action: "drag-drop", force: true });
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
  cy.url().should("contain", PATHS.settingsPage);
  cy.get('[aria-label="Name-value"]').should("contain", envName);
};

describe("Environment", function () {
  it("1.1 cancel creation of an environment", function () {
    cy.visit("/console/");
    cy.get(newEnvCard).click();
    cy.url().should("eq", Cypress.config().baseUrl + PATHS.createEnvPage);
    createEnv({
      envName: testName(1),
      projectName: testProjectName(1),
    });
    cy.get("button").contains("Cancel").click();
    cy.url().should("eq", Cypress.config().baseUrl + "/console/");
  });

  it("1.2 Create new  environment", function () {
    //fill the form and submit
    cy.visit(PATHS.createEnvPage);
    createEnv({
      envName: testName(2),
      projectName: testProjectName(2),
      shouldPassEnvName: false,
    });
    cy.get("button").contains("Submit").should("be.disabled");
    cy.get(nameInput).type(testName(2));
    cy.get("button").contains("Submit").should("not.be.disabled");
    cy.get("button").contains("Submit").click();
    cy.url().should("contain", PATHS.catalogPage);
    //go back to gome and check if env is visible
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
    cy.visit(PATHS.createEnvPage);
    createEnv({
      envName: testName(3),
      projectName: testProjectName(3),
      shouldPassEnvName: true,
      fillOptionalInputs: true,
    });
    cy.get("button").contains("Submit").click();
    cy.url().should("contain", PATHS.catalogPage);

    openSettings(testName(3));
    deleteEnv(testName(3), testProjectName(3));
  });

  it("1.4 Edit created environment", function () {
    //Fill The form and submit
    cy.visit(PATHS.createEnvPage);
    createEnv({
      envName: testName(4),
      projectName: testProjectName(4),
      shouldPassEnvName: true,
      fillOptionalInputs: true,
    });
    cy.get("button").contains("Submit").click();

    openSettings(testName(4));
    cy.wrap(parameterTypes).each((parameter) => {
      if (
        parameter.name !== "Repository" &&
        parameter.name !== "Branch" &&
        parameter.name !== "Icon"
      ) {
        cy.get('[aria-label="' + parameter.name + '-toggle-edit"]').click();
      }

      switch (parameter.type) {
        case "text":
          cy.get('[aria-label="' + parameter.name + '-input"]')
            .clear()
            .type("New Value " + parameter.name);
          break;
        case "icon":
          cy.get('[aria-label="' + parameter.name + '-toggle-edit"]').click({
            force: true,
          });
          cy.get(iconInput).selectFile(icon, {
            action: "drag-drop",
            force: true,
          });
          break;
        case "typeahead":
          cy.get('[aria-label="Project Name-typeahead"]')
            .clear()
            .type("New Value " + parameter.name);

          cy.get("button")
            .contains(`Create "New Value ${parameter.name}"`)
            .click();

          break;
        case "joined":
          cy.get('[aria-label="Repository Settings-toggle-edit"]')
            .should("be.visible")
            .click();
          cy.get(
            parameter.name === "Branch"
              ? '[aria-label="repo_branch-input"]'
              : '[aria-label="repo_url-input"]'
          )
            .clear()
            .type("New Value " + parameter.name);
          break;
      }
      if (parameter.name !== "Repository" && parameter.name !== "Branch") {
        cy.get('[aria-label="' + parameter.name + '-submit-edit"]').click();
        if (parameter.name === "Icon") {
          //by default that env doesn't have Icon
          cy.get('[aria-label="' + parameter.name + '-value"]').should(
            "not.have.text",
            "no icon"
          );
        } else {
          cy.get('[aria-label="' + parameter.name + '-value"]').should(
            "contain",
            "New Value " + parameter.name
          );
        }
      } else {
        cy.get('[aria-label="Repository Settings-submit-edit"]').click();
        if (parameter.name === "Repository") {
          cy.get('[aria-label="repo_url-value"]').should(
            "contain",
            "New Value " + parameter.name
          );
        } else {
          cy.get('[aria-label="repo_branch-value"]').should(
            "contain",
            "New Value " + parameter.name
          );
        }
      }
    });
    deleteEnv("New Value Name", "New Value Project Name");
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
    cy.intercept("/lsm/v1/service_catalog?instance_summary=True").as(
      "catalogUpdate"
    );
    cy.wait(20000);
    cy.get('[aria-label="ServiceCatalog-Success"]').should("to.be.visible");
  });

  it("1.6 Edit environment configuration", function () {
    cy.visit(PATHS.createEnvPage);
    createEnv({
      envName: testName(3),
      projectName: testProjectName(3),
      shouldPassEnvName: true,
      fillOptionalInputs: true,
    });
    cy.get("button").contains("Submit").click();
    cy.url().should("contain", PATHS.catalogPage);

    openSettings("test");
    cy.get("button").contains("Configuration");
    cy.wrap(configurationTypes).each((config) => {
      switch (config.type) {
        case "text":
          cy.get(config.row).clear().type(config.newValue);
          break;
        case "switch":
          cy.get(config.row).click();

          break;
        case "select":
          cy.get(config.row).click();
          cy.get("Row-" + config.name + " > td > .pf-c-select__menu-item")
            .contains(config.newValue)
            .click();

          break;
        case "selecMap":
          cy.get("Row-" + config.name + " > td ");

          break;
      }
      cy.get('[aria-label="Warning"]').should("be.visible");
      cy.get('[aria-label="SaveAction"]').click();
      cy.get('[aria-label="Warning"]').should("not.be.visible");

      switch (config.type) {
        case "text":
          cy.get(config.row).clear().type(config.newValue);
          break;
        case "switch":
          cy.get(config.row).click();

          break;
        case "select":
          cy.get(config.row).click();
          cy.get("Row-" + config.name + " > td > .pf-c-select__menu-item")
            .contains(config.newValue)
            .click();

          break;
        case "selecMap":
          cy.get("Row-" + config.name + " > td ");

          break;
      }
    });
    cy.get("button").contains("Environment");
    deleteEnv(6);
  });
});
