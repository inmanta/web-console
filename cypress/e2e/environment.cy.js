const icon = "./test-icon.png";

/// <reference types="Cypress" />
const newEnvCard = '[aria-label="Overview-Success"] > :first-child';
const projectNameInput = '[aria-label="Project Name-typeahead"]';
const newProjectName = '[aria-label="Project Name-select-input';
const newProjectNameButton = ".pf-c-select__menu-item";
const nameInput = '[aria-label="Name-input"]';
const descInput = '[aria-label="Description-input"]';
const repoInput = '[aria-label="Repository-input"]';
const branchInput = '[aria-label="Branch-input"]';
const iconInput = "#simple-text-file-filename";
describe("Environment", function () {
  // beforeEach(() => {
  //   cy.intercept("GET", "/api/v2/project?environment_details=false", {
  //     fixture: "environments.json",
  //   });
  //   cy.intercept("GET", "**/api/v1/serverstatus", {
  //     fixture: "serverstatus.json",
  //   });
  // });
  it("cancel creation of an environment", function () {
    cy.visit("/console/");
    cy.get(newEnvCard).click();
    cy.url().should(
      "eq",
      Cypress.config().baseUrl + "/console/environment/create"
    );
    cy.get(projectNameInput).type("Test Project Name");
    cy.get(newProjectName).within(() => {
      cy.get(newProjectNameButton).click();
    });
    cy.get(nameInput).type("TestName");
    cy.get(descInput).type("Test description");
    cy.get(repoInput).type("repository");
    cy.get(branchInput).type("branch");
    cy.get(iconInput).attachFile(icon);
    cy.get("button").contains("Cancel").click();
    cy.url().should("eq", Cypress.config().baseUrl + "/console/");
  });
  it("SubmitForm", function () {
    cy.visit("/console/environment/create");
    cy.get(projectNameInput).type("Test Project Name");
    cy.get(newProjectName).within(() => {
      cy.get(newProjectNameButton).click();
    });
    cy.get(descInput).type("Test description");
    cy.get(repoInput).type("repository");
    cy.get(branchInput).type("branch");
    cy.get(iconInput).attachFile(icon);
    cy.get("button").contains("Submit").should("be.disabled");
    cy.get(nameInput).type("TestName");
    cy.get("button").contains("Submit").should("not.be.disabled");
    cy.get("button").contains("Submit").click();
    cy.url().should("contain", "/console/lsm/catalog?env=");

    cy.get(".pf-c-breadcrumb__item").first().click();
    cy.url().should("eq", Cypress.config().baseUrl + "/console/");
    //expect new card with given properties to be there
  });
});
