/**
 * This scenario tests the Service Composer functionality.
 * It requires the PXSDC Project to be installed.
 *
 * Note: clicks on cards use force:true, because a card can sit under the minimap, the zoom
 * toolbar or another card's toolbar.
 */
import environmentHelpers from "../support/environmentHelpers.js";

const { selectEnvironment, waitForServiceCatalogUpdate } = environmentHelpers;

/**
 * Selects the card of an entity on the canvas by its display name.
 */
const entity = (name) => `[data-testid="entity-${name}"]`;

/**
 * Selects the cards of an embedded entity whose display name contains the given name.
 */
const entityContaining = (name) => `[data-testid^="entity-"][data-testid*="${name}"]`;

/**
 * Drags a link from the link action of the selected card onto the target card, the way
 * a user does: press on the link action, move onto the target, release.
 */
const linkSelectedEntityTo = (targetSelector) => {
  cy.get(".react-flow__node.selected .link-handle").then(($handle) => {
    const from = $handle[0].getBoundingClientRect();
    const fromX = from.left + from.width / 2;
    const fromY = from.top + from.height / 2;

    cy.get(targetSelector).then(($target) => {
      const to = $target[0].getBoundingClientRect();
      const toX = to.left + to.width / 2;
      const toY = to.top + to.height / 2;

      cy.wrap($handle).trigger("mousedown", { button: 0, clientX: fromX, clientY: fromY });
      cy.document().trigger("mousemove", { button: 0, clientX: fromX + 20, clientY: fromY + 20 });
      cy.document().trigger("mousemove", { button: 0, clientX: toX, clientY: toY });
      cy.document().trigger("mouseup", { button: 0, clientX: toX, clientY: toY });
    });
  });
};

/**
 * Drags an item of the palette onto the canvas, at the position getPosition yields.
 */
const dropPaletteItem = (group, item, getPosition) => {
  const dataTransfer = new DataTransfer();

  cy.get(`[data-testid="palette-group-${group}"] [data-testid="palette-item-${item}"]`)
    .first()
    .trigger("dragstart", { dataTransfer });

  getPosition().then(({ x, y }) => {
    cy.get('[data-testid="canvas"]')
      .trigger("dragover", { dataTransfer, clientX: x, clientY: y })
      .trigger("drop", { dataTransfer, clientX: x, clientY: y });
  });
};

const isIso = Cypress.expose("edition") === "iso";
const PXSDC_ENV_NAME = "Test PXSDC";
const PXSDC_PROJECT_NAME = "PXSDC Test Project";

if (isIso) {
  describe("Scenario 8 Composer", () => {
    before(() => {
      // ensure environment is not present before removing the project
      cy.request("/api/v2/environment?details=true").then((response) => {
        const environments = response.body.data || [];
        const environment = environments.find((item) => item.name === PXSDC_ENV_NAME);

        if (environment) {
          cy.request("DELETE", `/api/v2/environment/${environment.id}`);
        }
      });

      // delete only the PXSDC test project
      cy.request("/api/v2/project?environment_details=true").then((response) => {
        const projects = response.body.data || [];
        const project = projects.find((item) => item.name === PXSDC_PROJECT_NAME);

        if (project) {
          cy.request("DELETE", `api/v1/project/${project.id}`);
        }
      });
    });

    it("Should create pxsdc project from a repo url and create instances", () => {
      // Step 1: Create a new environment from repository.
      cy.visit("/console/environment/create");

      // Picking the (just-deleted) project creates it; useCreateProject then refetches the project
      // list (GET /api/v2/project). Alias that refetch after the initial load (so cy.wait gates on
      // it, not the load) and wait for it, so the project exists before we fill in the rest.
      cy.get('[aria-label="Project Name-select-toggleFilterInput"]').type(PXSDC_PROJECT_NAME);
      cy.intercept("GET", "**/api/v2/project?environment_details=*").as("projectsRefetch");
      cy.get('[role="option"]').contains(PXSDC_PROJECT_NAME).click();
      cy.wait("@projectsRefetch");

      cy.get('[aria-label="Name-input"]').type(PXSDC_ENV_NAME);
      cy.get('[aria-label="Description-input"]').type("Environment for PXSDC test model");

      cy.env(["GITLAB_TOKEN"]).then(({ GITLAB_TOKEN }) => {
        const repoUrl = `https://demo:${GITLAB_TOKEN}@code.inmanta.com/solutions/demos/front-end-pxsdc-test-model.git`;

        cy.get('[aria-label="Repository-input"]').type(repoUrl);
        cy.get('[aria-label="Repository-input"]').should("have.value", repoUrl);
        cy.get('[aria-label="Branch-input"]').type("master");
      });

      cy.get("button").contains("Submit").click();

      // Step 2: Update service catalog and wait until backend compile has completed.
      cy.intercept("POST", "**/lsm/v1/exporter/export_service_definition").as(
        "exportServiceDefinition"
      );
      cy.get("button").contains("Update Service Catalog").click();

      cy.get('[data-testid="dialog-submit"]').click();

      cy.url().then((url) => {
        const location = new URL(url);
        const id = location.searchParams.get("env");

        cy.wait("@exportServiceDefinition").then(({ response }) => {
          waitForServiceCatalogUpdate(id, response.body.data);
        });
      });

      cy.get('[aria-label="ServiceCatalog-Success"]', {
        timeout: 120000,
      }).should("to.be.visible");

      // Step 3: Open l3out inventory (an owned service, so expand the owners first) and start composer flow.
      cy.get("button").contains("Expand all").click();
      cy.get("#l3out").contains("Inventory").click();

      cy.get('[aria-label="AddInstanceToggle"]').click();
      cy.get("#add-instance-composer-button").click();

      cy.get('[data-testid="deploy-button"]').should("be.disabled");
      cy.get('[aria-label="service-description"]').should("have.text", "Telco cloud l3out");

      cy.get('[data-testid="left_sidebar"]').within(() => {
        cy.get('[data-testid="palette-group-l3out"]').should("exist");
        cy.get('[data-testid="palette-group-network"]').should("exist");
        cy.get('[data-testid="palette-group-project"]').should("exist");
        cy.get('[data-testid="palette-group-virtualmachine"]').should("exist");
        cy.get('[data-testid^="palette-group-"]').should("have.length", 4);
      });

      // Assert: Initial composer graph for l3out is loaded.
      cy.get(entity("l3out")).should("be.visible");
      cy.get('[data-testid="header-l3out"]').should("contain", "l3out");

      // The related entities render only after the composer's compile finishes (l3out shows first),
      // so give these canvas shapes room to appear instead of the default 10s.
      cy.get(entity("project"), { timeout: 60000 })
        .as("projectEntity")
        .should("have.attr", "data-invalid", "true");

      cy.get(entityContaining("ProjectNaming"), { timeout: 60000 }).as("projectNamingEntity");

      // Step 4: Connect project -> l3out.
      cy.get("@projectEntity").click({ force: true });
      cy.get(entity("l3out")).as("l3outEntity");
      linkSelectedEntityTo(entity("l3out"));

      // Assert: Validation state before filling required fields.
      cy.get('[data-testid="deploy-button"]').should("be.disabled");

      cy.get("@projectEntity").should("have.attr", "data-invalid", "true");
      cy.get("@l3outEntity").should("have.attr", "data-invalid", "true");
      cy.get("@projectNamingEntity").should("have.attr", "data-invalid", "false");

      // Step 5: Fill Project form fields.
      cy.get("#name").clear().type("pxs-project");

      cy.get("#environment").click({ force: true });
      cy.contains('[role="menuitem"], [role="option"]', /lab/i).click();

      cy.get("@projectNamingEntity").should("have.attr", "data-invalid", "false");

      // Step 6: Fill l3out form fields.
      cy.get("@l3outEntity").click({ force: true });
      cy.get("#name").clear().type("pxs-l3out");
      cy.get("#rd").clear().type("3");

      cy.get("@l3outEntity").should("have.attr", "data-invalid", "false");

      // Step 7: Deploy and validate resulting order details.
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
      selectEnvironment(PXSDC_ENV_NAME);
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("button").contains("Expand all").click();
      cy.get("#l3out").contains("Inventory").click();

      cy.get('[aria-label="InstanceRow-Intro"]', { timeout: 60000 }).should("contain", "pxs-l3out");

      cy.get('[aria-label="instance-details-link"]').first().click();
      cy.get('[aria-label="Actions-Toggle"]', { timeout: 20000 }).click();
      cy.contains('[role="menuitem"]', "Edit in Composer").click();

      // Step 2: Validate current inventory tab disabled state.
      cy.contains('[role="tab"]', "Inventory", { timeout: 20000 }).click();

      cy.get('[data-testid="palette-item-pxs-l3out"]', { timeout: 20000 })
        .should("have.attr", "aria-disabled", "true")
        .and("contain", "On canvas");

      cy.get('[data-testid="palette-item-pxs-project"]', { timeout: 20000 })
        .should("have.attr", "aria-disabled", "true")
        .and("contain", "On canvas");

      // Step 3: Delete l3out permanently from composer and verify it can't be added again.
      cy.get('[data-testid="deploy-button"]').should("be.enabled");

      cy.get(entity("l3out")).first().rightclick({ force: true });

      cy.get('[data-testid="entity-context-menu"]')
        .contains("button", "Delete permanently")
        .should("be.visible")
        .click();

      cy.get(entity("l3out")).should("not.exist");

      // The instance is not on the canvas, but is set to be deleted, so it can't be added again.
      cy.get('[data-testid="palette-item-pxs-l3out"]')
        .should("have.attr", "aria-disabled", "true")
        .and("contain", "Marked for deletion");

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

      cy.get("button").contains("Expand all").click();
      cy.get("#l3out").should("contain", "No instances");
      cy.get("#network").should("contain", "No instances");
      cy.get("#virtualmachine").should("contain", "No instances");
    });

    it("Should be able to add an instance and connect it to an existing instance", () => {
      // Step 1: Open project inventory and enter edit composer.
      cy.visit("/console/");
      selectEnvironment(PXSDC_ENV_NAME);
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#project").contains("Inventory").click();

      cy.get('[aria-label="ServiceInventory-Success"]', { timeout: 60000 }).should("be.visible");
      cy.get('[aria-label="InstanceRow-Intro"]', { timeout: 60000 }).should(
        "contain",
        "pxs-project"
      );

      cy.get('[aria-label="instance-details-link"]').first().click();
      cy.get('[aria-label="Actions-Toggle"]', { timeout: 20000 }).click();
      cy.contains('[role="menuitem"]', "Edit in Composer").click();

      // Assert: Existing project and ProjectNaming nodes are present.
      cy.get(entity("project"), { timeout: 20000 })
        .as("projectEntity")
        .should("be.visible")
        .and("contain", "pxs-project");
      cy.get(entityContaining("ProjectNaming"), { timeout: 20000 }).should("be.visible");

      // Step 2: Drag network from the palette onto the canvas, above project.
      dropPaletteItem("network", "network", () =>
        cy.get("@projectEntity").then(($projectEntity) => {
          const rect = $projectEntity[0].getBoundingClientRect();

          return { x: rect.left + rect.width / 2, y: rect.top - 80 };
        })
      );

      cy.get(entity("network"), { timeout: 20000 }).as("networkEntity");

      // Step 3: Fill network form fields.
      cy.get("@networkEntity").click({ force: true });
      cy.get("#name").clear().type("pxs-network");
      cy.get("#prefix_size").clear().type("5");

      // Step 4: Connect network -> project.
      linkSelectedEntityTo(entity("project"));

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

    it("Should not leak data between forms when clicking through multiple instances", () => {
      // Step 1: Open project inventory and enter edit composer.
      cy.visit("/console/");
      selectEnvironment(PXSDC_ENV_NAME);
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#project").contains("Inventory").click();

      cy.get('[aria-label="ServiceInventory-Success"]').should("be.visible");
      cy.get('[aria-label="InstanceRow-Intro"]').first().should("contain", "pxs-project");

      // Step 2: Click kebab menu on the first row and select "Edit in Composer".
      cy.get('[aria-label="InstanceRow-Intro"]')
        .first()
        .closest("tr")
        .find('[aria-label="row actions toggle"]')
        .click();

      cy.contains('[role="menuitem"]', "Edit in Composer").click();

      // Assert: Existing project node is present on the canvas.
      cy.get(entity("project"), { timeout: 20000 }).should("be.visible");

      // Step 3: Zoom out to create more room on the canvas.
      cy.get('[data-testid="zoom-out"]').click().click().click().click();

      // Step 4: Duo 1 - The existing project already has a ProjectNaming loaded from the instance.
      cy.get(entityContaining("ProjectNaming"), { timeout: 10000 }).should("have.length", 1);

      // Step 5: Duo 2 - Add a second project with its + button. Its ProjectNaming is auto-added.
      cy.get('[data-testid="palette-group-project"]')
        .find('button[aria-label="Add project to canvas"]')
        .click();

      cy.get(entity("project"), { timeout: 10000 })
        .should("have.length", 2)
        .eq(1)
        .as("secondProjectEntity");

      cy.get(entityContaining("ProjectNaming"), { timeout: 10000 }).should("have.length", 2);

      // Fill second project form fields.
      cy.get("@secondProjectEntity").click({ force: true });
      cy.get("#name").clear().type("pxs-project-2");
      cy.get("#environment").click({ force: true });
      cy.contains('[role="menuitem"], [role="option"]', /lab/i).click();

      // Step 6: Duo 3 - Drag a third project below the first one. Its ProjectNaming is auto-added.
      dropPaletteItem("project", "project", () =>
        cy
          .get(entity("project"))
          .first()
          .then(($existingProject) => {
            const rect = $existingProject[0].getBoundingClientRect();

            return { x: rect.left + rect.width / 2, y: rect.bottom + 120 };
          })
      );

      cy.get(entity("project"), { timeout: 10000 })
        .should("have.length", 3)
        .eq(2)
        .as("thirdProjectEntity");

      cy.get(entityContaining("ProjectNaming"), { timeout: 10000 }).should("have.length", 3);

      // Fill third project form fields.
      cy.get("@thirdProjectEntity").click({ force: true });
      cy.get("#name").clear().type("pxs-project-3");
      cy.get("#environment").click({ force: true });
      cy.contains('[role="menuitem"], [role="option"]', /lab/i).click();

      // Step 7: Click back and forth between the two new projects and assert form values don't bleed.
      cy.get("@secondProjectEntity").click({ force: true });
      cy.get("#name").should("have.value", "pxs-project-2");

      cy.get("@thirdProjectEntity").click({ force: true });
      cy.get("#name").should("have.value", "pxs-project-3");

      cy.get("@secondProjectEntity").click({ force: true });
      cy.get("#name").should("have.value", "pxs-project-2");

      cy.get("@thirdProjectEntity").click({ force: true });
      cy.get("#name").should("have.value", "pxs-project-3");

      // Step 8: Deploy and validate resulting order details.
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
        cy.get('[aria-label="LegendItem-completed"]').should("have.text", "3");
        cy.contains("3 / 3").should("be.visible");
      });
    });
  });
}
