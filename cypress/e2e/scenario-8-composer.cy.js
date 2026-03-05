/**
 * This scenario tests the Service Composer functionality.
 * It requires the PXSDC Project to be installed.
 *
 * Note: Several interactions use force:true because SVG/canvas drag handles
 * can intermittently fail Cypress actionability checks (overlap/re-render timing).
 */
import environmentHelpers from "../support/environmentHelpers";

const { checkStatusCompile } = environmentHelpers;

if (Cypress.env("edition") === "iso") {
  describe("Scenario 8 Composer", () => {
    before(() => {
      // Setup: Ensure a clean test state for this scenario.
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
        const project = projects.find((item) => item.name === projectName);

        if (project) {
          cy.request("DELETE", `api/v1/project/${project.id}`);
        }
      });
    });

    it("Should create pxsdc project from a repo url and create instances", () => {
      const envName = "PXSDC Test Env";
      const projectName = "PXSDC Test Project";

      // Step 1: Create a new environment from repository.
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

      // Step 2: Update service catalog and wait until backend compile has completed.
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

      // Step 3: Open l3out inventory and start composer flow.
      cy.get("#l3out").contains("Show inventory").click();

      cy.get('[aria-label="AddInstanceToggle"]').click();
      cy.get("#add-instance-composer-button").click();

      cy.get('[data-testid="deploy-button"]').should("be.disabled");
      cy.get('[aria-label="service-description"]').should("have.text", "Telco cloud l3out");

      cy.get("#instance-tab-element").within(() => {
        cy.get('.group[data-name="l3out"]').should("exist");
        cy.get('.group[data-name="network"]').should("exist");
        cy.get('.group[data-name="project"]').should("exist");
        cy.get('.group[data-name="virtualmachine"]').should("exist");
        cy.get(".group").should("have.length", 4);
      });

      // Assert: Initial composer graph for l3out is loaded.
      cy.get('g[data-type="app.ServiceEntityShape"]:has([data-testid="header-l3out"])')
        .should("exist")
        .and("have.attr", "cursor", "move")
        .and("have.class", "joint-cell")
        .and("have.class", "joint-type-app-serviceentityshape");

      cy.get('g[data-type="app.ServiceEntityShape"] [data-testid="header-l3out"]')
        .should("be.visible")
        .and("have.text", "l3out");

      // Step 4: Drag project shape onto canvas.
      cy.contains('g[data-type="standard.Path"] tspan', "project")
        .closest('g[data-type="standard.Path"]')
        .as("projectPath");

      cy.get('[data-testid="canvas"]').then(($canvas) => {
        const rect = $canvas[0].getBoundingClientRect();
        const boxSpacing = 140;
        const dropX = rect.left + rect.width / 2 + boxSpacing;
        const dropY = rect.top + rect.height / 2;

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
        .as("projectEntity")
        .within(() => {
          cy.get("rect.joint-halo-highlight-missing").should("exist");
        });

      // Step 5: Drag ProjectNaming shape above project.
      cy.contains('g[data-type="standard.Path"] tspan', "ProjectNaming")
        .closest('g[data-type="standard.Path"]')
        .as("projectNamingPath");

      cy.get("@projectEntity").then(($projectEntity) => {
        const projectRect = $projectEntity[0].getBoundingClientRect();
        const dropX = projectRect.left + projectRect.width / 2;
        const dropY = projectRect.top - 80;

        cy.get("@projectNamingPath").trigger("mousedown", {
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

      cy.contains('g[data-type="app.ServiceEntityShape"] tspan', "ProjectNaming", {
        timeout: 10000,
      })
        .closest('g[data-type="app.ServiceEntityShape"]')
        .as("projectNamingEntity")
        .within(() => {
          cy.get("rect.joint-halo-highlight-missing").should("exist");
        });

      // Step 6: Connect ProjectNaming -> project.
      cy.get("@projectNamingEntity").click({ force: true });

      cy.get("@projectEntity").then(($target) => {
        const targetRect = $target[0].getBoundingClientRect();
        const targetX = targetRect.left + targetRect.width / 2;
        const targetY = targetRect.top + targetRect.height / 2;

        cy.get('div.handle.link.e[data-action="link"]', { timeout: 10000 })
          .should("be.visible")
          .trigger("mousedown", {
            button: 0,
            which: 1,
            force: true,
          });

        cy.get("body").trigger("mousemove", {
          button: 0,
          which: 1,
          clientX: targetX,
          clientY: targetY,
          force: true,
        });

        cy.get("@projectEntity").trigger("mouseup", {
          button: 0,
          which: 1,
          clientX: targetX,
          clientY: targetY,
          force: true,
        });
      });

      // Step 7: Connect project -> l3out.
      cy.get("@projectEntity").click({ force: true });

      cy.get('g[data-type="app.ServiceEntityShape"]:has([data-testid="header-l3out"])').as(
        "l3outEntity"
      );

      cy.get("@l3outEntity").then(($target) => {
        const targetRect = $target[0].getBoundingClientRect();
        const targetX = targetRect.left + targetRect.width / 2;
        const targetY = targetRect.top + targetRect.height / 2;

        cy.get('div.handle.link.e[data-action="link"]', { timeout: 10000 })
          .should("be.visible")
          .trigger("mousedown", {
            button: 0,
            which: 1,
            force: true,
          });

        cy.get("body").trigger("mousemove", {
          button: 0,
          which: 1,
          clientX: targetX,
          clientY: targetY,
          force: true,
        });

        cy.get("@l3outEntity").trigger("mouseup", {
          button: 0,
          which: 1,
          clientX: targetX,
          clientY: targetY,
          force: true,
        });
      });

      // Assert: Validation state before filling required fields.
      cy.get('[data-testid="deploy-button"]').should("be.disabled");

      cy.get("@projectEntity").within(() => {
        cy.get("rect.joint-halo-highlight-missing").should("exist");
      });

      cy.get("@l3outEntity").within(() => {
        cy.get("rect.joint-halo-highlight-missing").should("exist");
      });

      cy.get("@projectNamingEntity").within(() => {
        cy.get("rect.joint-halo-highlight-missing").should("not.exist");
      });

      // Step 8: Fill Project form fields.
      cy.get("#name").clear().type("pxs-project");

      cy.get("#environment").click({ force: true });
      cy.contains('[role="menuitem"], [role="option"]', /lab/i).click();

      cy.get("@projectNamingEntity").within(() => {
        cy.get("rect.joint-halo-highlight-missing").should("not.exist");
      });

      // Step 9: Fill l3out form fields.
      cy.get("@l3outEntity").click({ force: true });
      cy.get("#name").clear().type("pxs-l3out");
      cy.get("#rd").clear().type("3");

      cy.get("@l3outEntity").within(() => {
        cy.get("rect.joint-halo-highlight-missing").should("not.exist");
      });

      // Step 10: Deploy and validate resulting order details.
      cy.get('[data-testid="deploy-button"]').should("be.enabled").click();

      cy.get('[aria-label="OrderDetailsView-Success"]', { timeout: 60000 }).should("be.visible");

      cy.get('[aria-label="OrderDetails-Heading"]').within(() => {
        cy.get('[aria-label="OrderDescription"]').contains("Requested with Instance Composer");
        cy.get('[aria-label="OrderState"] .pf-v6-c-label__text', { timeout: 120000 }).should(
          "contain",
          "success"
        );
      });

      cy.get('[aria-label="OrderDetails-Heading-Progress"]', { timeout: 120000 }).within(() => {
        cy.get('[aria-label="LegendItem-completed"]').should("have.text", "2");
        cy.contains("2 / 2").should("be.visible");
      });

      cy.get('[aria-label="ServiceOrderDetailsRow"]', { timeout: 120000 }).should("have.length", 2);

      cy.get('[aria-label="ServiceOrderDetailsRow"]')
        .contains("td", "project")
        .parent("tr")
        .within(() => {
          cy.contains("td", "CREATE").should("be.visible");
          cy.get(".pf-v6-c-label__text", { timeout: 120000 }).should("contain", "completed");
        });

      cy.get('[aria-label="ServiceOrderDetailsRow"]')
        .contains("td", "l3out")
        .parent("tr")
        .within(() => {
          cy.contains("td", "CREATE").should("be.visible");
          cy.get(".pf-v6-c-label__text", { timeout: 120000 }).should("contain", "completed");
        });
    });

    it("Should delete permanently an existing l3out instance", () => {
      // Step 1: Open existing l3out instance and enter edit composer.
      cy.visit("/console/");
      cy.get('[aria-label="Select-environment-PXSDC Test Env"]').click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#l3out").contains("Show inventory").click();

      cy.get('[aria-label="InstanceRow-Intro"]', { timeout: 60000 }).should("contain", "pxs-l3out");

      cy.get('[aria-label="instance-details-link"]').first().click();
      cy.get('[aria-label="Actions-Toggle"]', { timeout: 20000 }).click();
      cy.get('[role="menuitem"][aria-label="Edit-Composer"]').click();

      // Step 2: Validate current inventory tab disabled state.
      cy.get("#inventory-tab", { timeout: 20000 }).click();

      cy.contains('g[data-type="standard.Path"] tspan', "pxs-l3out", { timeout: 20000 })
        .closest('g[data-type="standard.Path"]')
        .as("pxsL3outInventoryItem");

      cy.contains('g[data-type="standard.Path"] tspan', "pxs-project", { timeout: 20000 })
        .closest('g[data-type="standard.Path"]')
        .as("pxsProjectInventoryItem");

      cy.get("@pxsL3outInventoryItem")
        .find('rect[joint-selector="bodyTwo"]')
        .should(($rect) => {
          const value = $rect.attr("class") || $rect.attr("class-name") || "";
          expect(value).to.contain("stencil_body-disabled");
        });

      cy.get("@pxsProjectInventoryItem")
        .find('rect[joint-selector="bodyTwo"]')
        .should(($rect) => {
          const value = $rect.attr("class") || $rect.attr("class-name") || "";
          expect(value).to.contain("stencil_body-disabled");
        });

      // Step 3: Delete l3out permanently from composer and verify it becomes available in inventory.
      cy.get('[data-testid="deploy-button"]').should("be.enabled");

      cy.get('g[data-type="app.ServiceEntityShape"]:has([data-testid="header-l3out"])')
        .first()
        .rightclick({ force: true });

      cy.contains("div.entity-context-menu-item", "Delete permanently", { timeout: 10000 })
        .should("be.visible")
        .click();

      cy.get("#inventory-tab", { timeout: 20000 }).click();

      cy.contains('g[data-type="standard.Path"] tspan', "pxs-l3out", { timeout: 20000 })
        .closest('g[data-type="standard.Path"]')
        .find('rect[joint-selector="bodyTwo"]')
        .should(($rect) => {
          const value = $rect.attr("class") || $rect.attr("class-name") || "";
          expect(value).to.not.contain("stencil_body-disabled");
        });

      // Step 4: Deploy and validate resulting order details.
      cy.get('[data-testid="deploy-button"]').should("be.enabled").click();

      cy.get('[aria-label="OrderDetailsView-Success"]', { timeout: 60000 }).should("be.visible");

      cy.get('[aria-label="OrderDetails-Heading"]').within(() => {
        cy.get('[aria-label="OrderDescription"]').contains("Requested with Instance Composer");
        cy.get('[aria-label="OrderState"] .pf-v6-c-label__text', { timeout: 120000 }).should(
          "contain",
          "success"
        );
      });

      cy.get('[aria-label="OrderDetails-Heading-Progress"]', { timeout: 120000 }).within(() => {
        cy.get('[aria-label="LegendItem-completed"]').should("have.text", "2");
        cy.contains("2 / 2").should("be.visible");
      });

      cy.get('[aria-label="ServiceOrderDetailsRow"]', { timeout: 120000 }).should("have.length", 2);

      cy.get('[aria-label="ServiceOrderDetailsRow"]')
        .contains("td", "project")
        .parent("tr")
        .within(() => {
          cy.contains("td", "UPDATE").should("be.visible");
          cy.get(".pf-v6-c-label__text", { timeout: 120000 }).should("contain", "completed");
        });

      cy.get('[aria-label="ServiceOrderDetailsRow"]')
        .contains("td", "l3out")
        .parent("tr")
        .within(() => {
          cy.contains("td", "DELETE").should("be.visible");
          cy.get(".pf-v6-c-label__text", { timeout: 120000 }).should("contain", "completed");
        });

      // Step 5: Return to service catalog and validate badge counters.
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get('[aria-label="ServiceCatalog-Success"]', { timeout: 60000 }).should("be.visible");

      cy.get('#project [aria-label="Number of instances by label"] .pf-v6-c-label__text')
        .should("have.length", 1)
        .and("have.text", "1");

      cy.get('#l3out [aria-label="Number of instances by label"] .pf-v6-c-label').should(
        "not.exist"
      );
      cy.get('#network [aria-label="Number of instances by label"] .pf-v6-c-label').should(
        "not.exist"
      );
      cy.get('#virtualmachine [aria-label="Number of instances by label"] .pf-v6-c-label').should(
        "not.exist"
      );
    });

    it("Should be able to add an instance and connect it to an existing instance", () => {
      // Step 1: Open project inventory and enter edit composer.
      cy.visit("/console/");
      cy.get('[aria-label="Select-environment-PXSDC Test Env"]').click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#project").contains("Show inventory").click();

      cy.get('[aria-label="ServiceInventory-Success"]', { timeout: 60000 }).should("be.visible");
      cy.get('[aria-label="InstanceRow-Intro"]', { timeout: 60000 }).should(
        "contain",
        "pxs-project"
      );

      cy.get('[aria-label="instance-details-link"]').first().click();
      cy.get('[aria-label="Actions-Toggle"]', { timeout: 20000 }).click();
      cy.get('[role="menuitem"][aria-label="Edit-Composer"]').click();

      // Assert: Existing project and ProjectNaming nodes are present.
      cy.contains('g[data-type="app.ServiceEntityShape"] tspan', "project", {
        timeout: 20000,
      }).should("be.visible");
      cy.contains('g[data-type="app.ServiceEntityShape"] tspan', "ProjectNaming", {
        timeout: 20000,
      }).should("be.visible");

      cy.get('g[data-type="app.ServiceEntityShape"]:has([data-testid="header-project"])')
        .should("exist")
        .within(() => {
          cy.get('rect[joint-selector="body"]').should("exist");
          cy.contains("tspan", "pxs-project").should("be.visible");
        });

      // Step 2: Drag network node above project.
      cy.contains('g[data-type="standard.Path"] tspan', "network", { timeout: 20000 })
        .closest('g[data-type="standard.Path"]')
        .as("networkPath");

      cy.get('g[data-type="app.ServiceEntityShape"]:has([data-testid="header-project"])').as(
        "projectEntity"
      );

      cy.get("@projectEntity").then(($projectEntity) => {
        const projectRect = $projectEntity[0].getBoundingClientRect();
        const dropX = projectRect.left + projectRect.width / 2;
        const dropY = projectRect.top - 80;

        cy.get("@networkPath").trigger("mousedown", {
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

      cy.get('g[data-type="app.ServiceEntityShape"]:has([data-testid="header-network"])', {
        timeout: 20000,
      }).as("networkEntity");

      // Step 3: Fill network form fields.
      cy.get("@networkEntity").click({ force: true });
      cy.get("#name").clear().type("pxs-network");
      cy.get("#prefix_size").clear().type("5");

      // Step 4: Connect network -> project.
      cy.get("@projectEntity").then(($target) => {
        const targetRect = $target[0].getBoundingClientRect();
        const targetX = targetRect.left + targetRect.width / 2;
        const targetY = targetRect.top + targetRect.height / 2;

        cy.get('div.handle.link.e[data-action="link"]', { timeout: 10000 })
          .should("be.visible")
          .trigger("mousedown", {
            button: 0,
            which: 1,
            force: true,
          });

        cy.get("body").trigger("mousemove", {
          button: 0,
          which: 1,
          clientX: targetX,
          clientY: targetY,
          force: true,
        });

        cy.get("@projectEntity").trigger("mouseup", {
          button: 0,
          which: 1,
          clientX: targetX,
          clientY: targetY,
          force: true,
        });
      });

      // Step 5: Deploy and validate resulting order details.
      cy.get('[data-testid="deploy-button"]').should("be.enabled").click();

      cy.get('[aria-label="OrderDetailsView-Success"]', { timeout: 60000 }).should("be.visible");

      cy.get('[aria-label="OrderDetails-Heading"]').within(() => {
        cy.get('[aria-label="OrderDescription"]').contains("Requested with Instance Composer");
        cy.get('[aria-label="OrderState"] .pf-v6-c-label__text', { timeout: 120000 }).should(
          "contain",
          "success"
        );
      });

      cy.get('[aria-label="OrderDetails-Heading-Progress"]', { timeout: 120000 }).within(() => {
        cy.get('[aria-label="LegendItem-completed"]').should("have.text", "2");
        cy.contains("2 / 2").should("be.visible");
      });

      cy.get('[aria-label="ServiceOrderDetailsRow"]', { timeout: 120000 }).should("have.length", 2);

      cy.get('[aria-label="ServiceOrderDetailsRow"]')
        .contains("td", "network")
        .parent("tr")
        .within(() => {
          cy.contains("td", "CREATE").should("be.visible");
          cy.get(".pf-v6-c-label__text", { timeout: 120000 }).should("contain", "completed");
        });

      cy.get('[aria-label="ServiceOrderDetailsRow"]')
        .contains("td", "project")
        .parent("tr")
        .within(() => {
          cy.contains("td", "UPDATE").should("be.visible");
          cy.get(".pf-v6-c-label__text", { timeout: 120000 }).should("contain", "completed");
        });
    });
  });
}
