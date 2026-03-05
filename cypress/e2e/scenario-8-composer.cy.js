/**
 * This scenario tests the Service Composer functionality. 
 * It requires the PXSDC Project to be installed.
 */
const { checkStatusCompile } = require("../support/environmentHelpers");

if (Cypress.env("edition") === "iso") {
  describe("Scenario 8 Composer", () => {
    before(() => {
      const envName = "PXSDC Test Env";
      const projectName = "PXSDC Test Project";

      // ensure environment is not present before removing the project
      cy.request("/api/v2/environment?details=true").then((response) => {
        const environments = response.body.data || [];
        const environment = environments.find((item) => item.name === envName);

        if (environment) {
          cy.request("DELETE", `/api/v2/environment/${environment.id}`);
        }
      });

      // delete only the PXSDC test project
      cy.request("/api/v2/project?environment_details=true").then((response) => {
        const projects = response.body.data || [];
        const project = projects.find(
          (item) => item.name === projectName
        );

        if (project) {
          cy.request("DELETE", `api/v1/project/${project.id}`);
        }
      });
    });

    it("Should create pxsdc project from a repo url", () => {
      const envName = "PXSDC Test Env";
      const projectName = "PXSDC Test Project";

      cy.visit("/console/environment/create");

      cy.get('[aria-label="Project Name-select-toggleFilterInput"]').type(projectName);
      cy.get('[role="option"]').contains(projectName).click();

      cy.get('[aria-label="Name-input"]').type(envName);
      cy.get('[aria-label="Description-input"]').type("Environment for PXSDC test model");

      cy.env(["GITLAB_TOKEN"]).then(({ GITLAB_TOKEN }) => {
        const repoUrl = `https://demo:${GITLAB_TOKEN}@code.inmanta.com/solutions/demos/front-end-pxsdc-test-model.git`;

        cy.get('[aria-label="Repository-input"]').type(repoUrl);
        cy.get('[aria-label="Branch-input"]').type("master");
      });

      cy.get("button").contains("Submit").click();

      // update catalog to have all services available for the test
      cy.get("button").contains("Update Service Catalog").click();

      cy.get('[data-testid="dialog-submit"]').click();

      cy.url().then((url) => {
        const location = new URL(url);
        const id = location.searchParams.get("env");

        checkStatusCompile(id);
      });

      cy.get('[aria-label="ServiceCatalog-Success"]', {
        timeout: 120000,
      }).should("to.be.visible");

      // click on the button of the first service in the catalog to open the details
      cy.get("#l3out").contains("Show inventory").click();

      cy.get('[aria-label="AddInstanceToggle"]').click();
      cy.get('#add-instance-composer-button').click();

      cy.get('[data-testid="deploy-button"]').should("be.disabled");
      cy.get('[aria-label="service-description"]').should("have.text", "Telco cloud l3out");

      cy.get("#instance-tab-element").within(() => {
        cy.get('.group[data-name="l3out"]').should("exist");
        cy.get('.group[data-name="network"]').should("exist");
        cy.get('.group[data-name="project"]').should("exist");
        cy.get('.group[data-name="virtualmachine"]').should("exist");
        cy.get(".group").should("have.length", 4);
      });

      cy.get('g[data-type="app.ServiceEntityShape"]:has([data-testid="header-l3out"])')
        .should("exist")
        .and("have.attr", "cursor", "move")
        .and("have.class", "joint-cell")
        .and("have.class", "joint-type-app-serviceentityshape");

      cy.get('g[data-type="app.ServiceEntityShape"] [data-testid="header-l3out"]')
        .should("be.visible")
        .and("have.text", "l3out");

      cy.contains('g[data-type="standard.Path"] tspan', "project")
        .closest('g[data-type="standard.Path"]')
        .as("projectPath");

      cy.get('[data-testid="canvas"]').then(($canvas) => {
        const rect = $canvas[0].getBoundingClientRect();
        const boxSpacing = 140;
        const dropX = rect.left + (rect.width / 2) + boxSpacing;
        const dropY = rect.top + (rect.height / 2);

        cy.get("@projectPath").trigger("mousedown", {
          button: 0,
          which: 1,
          force: true,
        });

        cy.get("body").trigger("mousemove", {
          button: 0,
          which: 1,
          clientX: dropX,
          clientY: dropY,
          force: true,
        });

        cy.get('[data-testid="canvas"]').trigger("mouseup", {
          button: 0,
          which: 1,
          clientX: dropX,
          clientY: dropY,
          force: true,
        });
      });

      cy.contains('g[data-type="app.ServiceEntityShape"] tspan', "project", { timeout: 10000 })
        .closest('g[data-type="app.ServiceEntityShape"]')
        .within(() => {
          cy.get("rect.joint-halo-highlight-missing").should("exist");
        });
    });
  });
}