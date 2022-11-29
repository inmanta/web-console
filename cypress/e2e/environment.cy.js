import "cypress-file-upload";
const icon = "./test-icon.png";

/// <reference types="Cypress" />
const parameterTypes = [
  { name: "Project Name", type: "typeahead" },
  { name: "Name", type: "text" },
  { name: "Description", type: "text" },
  { name: "Repository", type: "joined" },
  { name: "Branch", type: "joined" },
  { name: "Icon", type: "toggle" },
];
const configurationTypes = [
  {
    name: "agent_trigger_method_on_auto_deploy",
    inputType: "select",
    newValue: "push_full_deploy",
  },
  {
    name: "auto_deploy",
    inputType: "switch",
    newValue: "false",
  },
  {
    name: "auto_full_compile",
    inputType: "text",
    newValue: "test Value",
  },
  {
    name: "autostart_agent_deploy_interval",
    inputType: "text",
    newValue: "610",
  },
  {
    name: "autostart_agent_deploy_splay_time",
    inputType: "text",
    newValue: "20",
  },
  {
    name: "autostart_agent_interval",
    inputType: "text",
    newValue: "610",
  },
  {
    name: "autostart_agent_map",
    inputType: "textmap",
    newValue: "",
  },

  {
    name: "autostart_agent_repair_interval",
    inputType: "text",
    newValue: "86410",
  },
  {
    name: "autostart_agent_repair_splay_time",
    inputType: "text",
    newValue: "610",
  },
  {
    name: "autostart_on_start",
    inputType: "switch",
    newValue: "false",
  },
  {
    name: "autostart_splay",
    inputType: "text",
    newValue: "20",
  },
  {
    name: "available_versions_to_keep",
    inputType: "text",
    newValue: "110",
  },
  {
    name: "environment_agent_trigger_method",
    inputType: "select",
    newValue: "push_incremental_deploy",
  },
  {
    name: "lsm_partial_compile",
    inputType: "switch",
    newValue: "true",
  },
  {
    name: "notification_retention",
    inputType: "text",
    newValue: "375",
  },
  {
    name: "protected_environment",
    inputType: "switch",
    newValue: "true",
  },
  {
    name: "purge_on_delete",
    inputType: "switch",
    newValue: "true",
  },
  {
    name: "push_on_auto_deploy",
    inputType: "switch",
    newValue: "false",
  },
  {
    name: "resource_action_logs_retention",
    inputType: "text",
    newValue: "8",
  },
  {
    name: "server_compile",
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

const createEnv = (number, shouldTypeName = true, isShort = false) => {
  cy.get(projectNameInput).type(testProjectName(number));
  cy.get(newProjectName).within(() => {
    cy.get(newProjectNameButton).click();
  });
  if (shouldTypeName) {
    cy.get(nameInput).type(testName(number));
  }
  if (!isShort) {
    cy.get(descInput).type("Test description");
    cy.get(repoInput).type("repository");
    cy.get(branchInput).type("branch");
    cy.get(iconInput).attachFile(icon);
  }
};

const deleteEnv = (number) => {
  cy.get("button").contains("Delete environment").click();
  cy.get('[aria-label="delete"]').should("be.disabled");

  cy.get('[aria-label="delete environment check"]').type(testName(number));
  cy.get('[aria-label="delete"]').should("not.be.disabled").click();
  cy.url().should("eq", Cypress.config().baseUrl + "/console/");
  cy.get('[aria-label="Environment card"]')
    .contains(testProjectName(number))
    .should("not.exist");
};

describe("Environment", function () {
  it("1.1 cancel creation of an environment", function () {
    cy.visit("/console/");
    cy.get(newEnvCard).click();
    cy.url().should(
      "eq",
      Cypress.config().baseUrl + "/console/environment/create"
    );
    createEnv(1);
    cy.get("button").contains("Cancel").click();
    cy.url().should("eq", Cypress.config().baseUrl + "/console/");
  });

  it("1.2 Create ne environment", function () {
    //fill the form and submit
    cy.visit("/console/environment/create");
    createEnv(2, false);
    cy.get("button").contains("Submit").should("be.disabled");
    cy.get(nameInput).type(testName(2));
    cy.get("button").contains("Submit").should("not.be.disabled");
    cy.get("button").contains("Submit").click();
    cy.url().should("contain", "/console/lsm/catalog?env=");
    //go back to gome and check if env is visible
    cy.get(".pf-c-breadcrumb__item").first().click();
    cy.url().should("eq", Cypress.config().baseUrl + "/console/");
    cy.get('[aria-label="Environment card"]').should(
      "any.contain",
      testName(2)
    );
  });

  it("1.3 delete an environment", function () {
    //Fill The form and submit
    cy.visit("/console/environment/create");
    createEnv(3, true, true);
    cy.get("button").contains("Submit").click();
    cy.url().should("contain", "/console/lsm/catalog?env=");
    //Go to settings
    cy.get('[aria-label="Settings actions"]').click();
    cy.url().should("contain", "/console/settings?env=");
    cy.get('[aria-label="Name-value"]').should("contain", testName(3));
    deleteEnv(3);
  });

  it("1.4 Edit created environment", function () {
    //Fill The form and submit
    cy.visit("/console/environment/create");
    createEnv(4, true, true);
    cy.get("button").contains("Submit").click();
    //Go to settings
    cy.get('[aria-label="Settings actions"]').click();
    cy.get('[aria-label="Name-value"]').should("contain", testName(4));
    cy.wrap(parameterTypes).each((parameter) => {
      if (parameter.name !== "Repository" && parameter.name !== "Branch") {
        cy.get('[aria-label="' + parameter.name + '-toggle-edit"]').click({
          force: true,
        });
      }

      switch (parameter.type) {
        case "text":
          cy.get('[aria-label="' + parameter.name + '-input"]')
            .clear()
            .type("New Value " + parameter.name);
          break;
        case "icon":
          cy.get(iconInput).attachFile(icon);
          break;
        case "typeahead":
          cy.get('[aria-label="Project Name-typeahead"]')
            .clear()
            .type("New Value " + parameter.name);

          cy.get('[aria-label="Project Name-select-input"]').then(($list) => {
            if (
              $list.find(
                (element) =>
                  element.textContent === `Create "New Value ${parameter.name}"`
              ).length > 0
            ) {
              cy.get("button")
                .contains(`Create "New Value ${parameter.name}"`)
                .click();
            } else {
              cy.get("button").contains(`New Value ${parameter.name}`).click();
            }
          });

          break;
        case "joined":
          cy.get('[aria-label="Repository Settings-toggle-edit"]').click();
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
        cy.get('[aria-label="' + parameter.name + '-value"]').should(
          "contain",
          "New Value " + parameter.name
        );
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
    deleteEnv(4);
  });

  it("1.5 Clear environment", function () {
    //Fill The form and submit
    cy.visit("/console/");
    cy.get('[aria-label="Environment card"]').contains("test").click();
    cy.get('[aria-label="ServiceCatalog-Success"]').should("to.be.visible");

    //Go to settings
    cy.get('[aria-label="Settings actions"]').click();
    cy.url().should("contain", "/console/settings?env=");
    cy.get('[aria-label="Name-value"]').should("contain", "test");

    //Cancel Clear Env and expect nothing to change
    cy.get("button").contains("Clear environment").click();
    cy.get("button").contains("Cancel").click();
    cy.visit("/console/");
    cy.get('[aria-label="Environment card"]').contains("test").click();
    cy.get('[aria-label="ServiceCatalog-Success"]').should("to.be.visible");

    //Go to settings
    cy.get('[aria-label="Settings actions"]').click();
    cy.url().should("contain", "/console/settings?env=");
    cy.get('[aria-label="Name-value"]').should("contain", "test");

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
    cy.intercept(
      "/api/v2/environment/a5f9f7f2-5f43-4fad-a16d-f71f127f0e91?details=fals"
    ).as("catalogUpdate");
    cy.wait("@catalogUpdate")
      .its("response.body")
      .then(() => {
        cy.get('[aria-label="ServiceCatalog-Success"]').should("to.be.visible");
      });
  });

  it("1.6 Edit environment configuration", function () {
    cy.visit("/console/environment/create");
    createEnv(6, true, true);
    cy.get("button").contains("Submit").click();
    cy.url().should("contain", "/console/lsm/catalog?env=");

    cy.get('[aria-label="Settings actions"]').click();
    cy.get('[aria-label="Name-value"]').should("eq", testName(6));
    cy.get('[aria-label="Settings actions"]').click();
    cy.get("button").contains("Configuration");
    cy.wrap(configurationTypes).each((config) => {
      switch (config.type) {
        case "text":
          cy.get("Row-" + config.name + " > td > input")
            .clear()
            .tpye(config.newValue);
          break;
        case "switch":
          cy.get("Row-" + config.name + " > td > input").click();

          break;
        case "select":
          cy.get("Row-" + config.name + " > td > input").click();
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
          cy.get("Row-" + config.name + " > td > input")
            .clear()
            .tpye(config.newValue);
          break;
        case "switch":
          cy.get("Row-" + config.name + " > td > input").click();

          break;
        case "select":
          cy.get("Row-" + config.name + " > td > input").click();
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
