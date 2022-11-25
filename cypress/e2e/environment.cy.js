import "cypress-file-upload";
const icon = "./test-icon.png";

/// <reference types="Cypress" />
const parameterTypes = [
  "Project Name",
  "Name",
  "Decsription",
  "Repository",
  "Branch",
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

describe("Environment", function () {
  beforeEach(() => {
    cy.intercept("GET", "/api/v2/project?environment_details=false", {
      fixture: "environments.json",
    });
    cy.intercept("GET", "**/api/v1/serverstatus", {
      fixture: "serverstatus.json",
    });
  });
  it("cancel creation of an environment", function () {
    cy.visit("/console/");
    cy.get(newEnvCard).click();
    cy.url().should(
      "eq",
      Cypress.config().baseUrl + "/console/environment/create"
    );
    cy.get(projectNameInput).type(testProjectName(1));
    cy.get(newProjectName).within(() => {
      cy.get(newProjectNameButton).click();
    });
    cy.get(nameInput).type(testName(1));
    cy.get(descInput).type("Test description");
    cy.get(repoInput).type("repository");
    cy.get(branchInput).type("branch");
    cy.get(iconInput).attachFile(icon);
    cy.get("button").contains("Cancel").click();
    cy.url().should("eq", Cypress.config().baseUrl + "/console/");
  });
  it("SubmitForm", function () {
    //fill the form and submit
    cy.visit("/console/environment/create");
    cy.get(projectNameInput).type(testProjectName(2));
    cy.get(newProjectName).within(() => {
      cy.get(newProjectNameButton).click();
    });
    cy.get(descInput).type("Test description");
    cy.get(repoInput).type("repository");
    cy.get(branchInput).type("branch");
    cy.get(iconInput).attachFile(icon);
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
  it("delete env", function () {
    //Fill The form and submit
    cy.visit("/console/environment/create");
    cy.get(projectNameInput).type(testProjectName(3));
    cy.get(newProjectName).within(() => {
      cy.get(newProjectNameButton).click();
    });
    cy.get(nameInput).type(testName(3));
    cy.get("button").contains("Submit").click();
    cy.url().should("contain", "/console/lsm/catalog?env=");
    //Go to settings
    cy.get('[aria-label="Settings actions"]').click();
    cy.url().should("contain", "/console/settings?env=");
    cy.get('[aria-label="Name-value"]').should("eq", testName(3));
    //Delete Env
    cy.get(".pf-c-button.pf-m-danger").contains("Delete Environment").click();
    cy.get('[aria-label="delete"]').should("be.disabled");

    cy.get('[aria-label="Settings actions"]').type(testProjectName(3));
    cy.get('[aria-label="delete"]').should("be.disabled");
    cy.get('[aria-label="Environment card"]')
      .contains(testProjectName(3))
      .should("not.exist");
  });
  it("edit env", function () {
    cy.visit("/console/environment/create");
    cy.get(projectNameInput).type(testProjectName(4));
    cy.get(newProjectName).within(() => {
      cy.get(newProjectNameButton).click();
    });
    cy.get(nameInput).type(testName(4));
    cy.get("button").contains("Submit").click();
    cy.url().should("contain", "/console/lsm/catalog?env=");
    cy.get('[aria-label="Name-value"]').should("eq", testName(4));

    cy.wrap(parameterTypes).each((parameter) => {
      cy.get("#button-" + parameter).click();
    });
    cy.get('[aria-label="Settings actions"]').click();
    cy.url().should("contain", "/console/settings?env=");
    cy.get(".pf-c-button.pf-m-danger").contains("Delete Environment").click();
    cy.get('[aria-label="delete"]').should("be.disabled");

    cy.get('[aria-label="Settings actions"]').type(testProjectName(4));
    cy.get('[aria-label="delete"]').should("be.disabled");
    cy.get('[aria-label="Environment card"]')
      .contains(testProjectName(4))
      .should("not.exist");
  });
  it("clear env", function () {
    //Fill The form and submit
    cy.visit("/console/environment/create");
    cy.get(projectNameInput).type(testProjectName(5));
    cy.get(newProjectName).within(() => {
      cy.get(newProjectNameButton).click();
    });
    cy.get(nameInput).type(testName(5));
    cy.get("button").contains("Submit").click();
    cy.url().should("contain", "/console/lsm/catalog?env=");
    //Go to settings
    cy.get('[aria-label="Settings actions"]').click();
    cy.url().should("contain", "/console/settings?env=");
    cy.get('[aria-label="Name-value"]').should("eq", testName(5));
    //Delete Env
    cy.get(".pf-c-button.pf-m-danger").contains("Delete Environment").click();
    cy.get('[aria-label="delete"]').should("be.disabled");

    cy.get('[aria-label="Settings actions"]').type(testProjectName(5));
    cy.get('[aria-label="delete"]').should("be.disabled");
    cy.get('[aria-label="Environment card"]')
      .contains(testProjectName(5))
      .should("not.exist");
  });
  it("edit env config", function () {
    cy.visit("/console/environment/create");
    cy.get(projectNameInput).type(testProjectName(6));
    cy.get(newProjectName).within(() => {
      cy.get(newProjectNameButton).click();
    });
    cy.get(nameInput).type(testName(6));
    cy.get("button").contains("Submit").click();
    cy.url().should("contain", "/console/lsm/catalog?env=");

    cy.get('[aria-label="Settings actions"]').click();
    cy.url().should("contain", "/console/settings?env=");
    cy.get(".pf-c-button.pf-m-danger").contains("Delete Environment").click();
    cy.get('[aria-label="delete"]').should("be.disabled");

    cy.get('[aria-label="Settings actions"]').type(testProjectName(6));
    cy.get('[aria-label="delete"]').should("be.disabled");
    cy.get('[aria-label="Environment card"]')
      .contains(testProjectName(6))
      .should("not.exist");
  });
});
