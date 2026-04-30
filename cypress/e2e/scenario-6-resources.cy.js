import environmentHelpers from "../support/environmentHelpers";

const { clearEnvironment, forceUpdateEnvironment } = environmentHelpers;

const isIso = Cypress.expose("edition") === "iso";

// Helper to verify filtered count is less than initial
const expectFilteredLessThan = (alias) => {
  cy.get(`@${alias}`).then((initialCount) => {
    cy.get('[aria-label="Resource Table Row"]').should(($rows) => {
      expect($rows.length).to.be.lessThan(initialCount);
    });
  });
};

// Helper to verify row count is restored to initial
const expectRowCountRestored = (alias) => {
  cy.get(`@${alias}`).then((initialCount) => {
    cy.get('[aria-label="Resource Table Row"]').should("have.length", initialCount);
  });
};

describe("Scenario 6 : Resources", () => {
  if (isIso) {
    before(() => {
      clearEnvironment();
      forceUpdateEnvironment();
    });
  }

  it("6.1 Initial state", () => {
    cy.visit("/console/");
    cy.get('[aria-label="Select-environment-test"]').click();
    cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Resources").click();

    // Expect 0 or 5 resources depending on edition
    cy.get('[data-testid="deploying-label"]').should("contain", isIso ? "0" : "5");
    isIso && cy.get('[aria-label="ResourcesPage-Empty"]').should("to.be.visible");
  });

  if (isIso) {
    it("6.2 Add instance on the resource-states service", () => {
      cy.visit("/console/");
      cy.get('[aria-label="Select-environment-test"]').click();

      // Store initial resource count
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Resources").click();
      cy.get("body").then(($body) => {
        cy.wrap($body.find('[aria-label="Resource Table Row"]').length).as("initialRowCount");
      });

      // Add a new instance via resource-states service
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#resource-states").contains("Show inventory").click();
      cy.get("#add-instance-button").click();
      cy.get("#name").type("test");
      cy.get("button").contains("Confirm").click();

      cy.get('[aria-label="Instance-Details-Success"]', { timeout: 20000 }).should("be.visible");

      // Verify 26 new resources were added
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Resources").click();
      cy.get("@initialRowCount").then((initialRowCount) => {
        cy.get('[aria-label="Resource Table Row"]', { timeout: 45000 }).should(
          "have.length",
          initialRowCount + 26
        );
      });

      // Verify details of the target resource
      const resourceName = "test-compliant-successful-not-blocked-0";
      cy.contains('[aria-label="Resource Table Row"]', resourceName).should("be.visible");
      cy.contains('[aria-label="Resource Table Row"]', resourceName)
        .find("button")
        .contains("Show Details")
        .click();

      const expectedAttributes = {
        compliance: "compliant",
        deploying_time_s: "0",
        handler_result: "successful",
        receive_events: "false",
        report_only: "false",
        revision: "0",
        send_event: "true",
      };

      Object.entries(expectedAttributes).forEach(([key, value]) => {
        cy.get(`[data-testid="attribute-${key}"]`).should("contain", value);
      });

      // Requires tab should be empty
      cy.get("button").contains("Requires").click();
      cy.get('[aria-label="ResourceRequires-Empty"]').should("contain", "No requirements found");

      // History tab should have 1 row with 0 requires, expand and verify same attributes
      cy.get("button").contains("History").click();
      cy.get('[aria-label="Resource History Table Row"]').should("have.length", 1);
      cy.get('[data-label="Requires"]').should("contain", "0");
      cy.get('[aria-label="Details"]').click();

      Object.entries(expectedAttributes).forEach(([key, value]) => {
        cy.get(`[data-testid="attribute-${key}"]`).should("contain", value);
      });

      cy.get("button").contains("Requires").click();
      cy.get('[aria-label="ResourceRequires-Empty"]').should("contain", "No requirements found");

      // Logs tab should have at least 4 messages with 100 as default page size
      cy.get("button").contains("Logs").click();
      cy.get('[aria-label="ResourceLogRow"]', { timeout: 40000 }).should("have.length.at.least", 4);
      cy.get('[id="PaginationWidget-top-top-toggle"]').click();
      cy.get('[data-action="per-page-100"]').should("contain", "100");
      cy.get('[data-action="per-page-100"]').find("svg").should("exist");
    });

    it("6.3 Log message filtering", () => {
      cy.visit("/console/");
      cy.get('[aria-label="Select-environment-test"]').click();

      // Navigate to the target resource logs
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Resources").click();
      cy.contains('[aria-label="Resource Table Row"]', "test-compliant-successful-not-blocked-0")
        .find("button")
        .contains("Show Details")
        .click();
      cy.get("button").contains("Logs").click();

      // Store initial log count
      cy.get('[aria-label="ResourceLogRow"]').then(($rows) => {
        cy.wrap($rows.length).as("initialRowCount");
      });

      // Apply INFO filter and verify count decreases
      cy.get('[aria-label="MinimalLogLevelFilterInput"]').click();
      cy.get('[role="option"]').contains("INFO").click();
      expectFilteredLessThan("initialRowCount");

      // Remove filter and verify count is restored
      cy.get('[aria-label="Close INFO"]').click();
      cy.get("@initialRowCount").then((initialRowCount) => {
        cy.get('[aria-label="ResourceLogRow"]').should("have.length", initialRowCount);
      });
    });

    it("6.4 Resources with multiple dependencies", () => {
      cy.visit("/console/");
      cy.get('[aria-label="Select-environment-test"]').click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Resources").click();

      const resourceName = "test-has-update-failed-blocked-0";
      const requireA =
        "frontend_model::resource_states::ResourceStateResource[internal,_name=test-undefined-new-blocked-0]";
      const requireB =
        "frontend_model::resource_states::ResourceStateResource[infinite-deploys-test-has-update-new-not-blocked-deploying-0,_name=test-has-update-new-not-blocked-deploying-0]";

      // Verify the compound status dialog shows 2 requirements
      cy.contains('[aria-label="Resource Table Row"]', resourceName)
        .find('[aria-label="Show status details"]')
        .click();
      cy.get('[role="dialog"]', { timeout: 10000 })
        .should("be.visible")
        .within(() => {
          cy.contains("2 Requirements").should("exist");
        });
      cy.get('[role="dialog"]').find('[aria-label="Close"]').click();

      // Navigate to details and verify both requirements are listed
      cy.contains('[aria-label="Resource Table Row"]', resourceName)
        .find("button")
        .contains("Show Details")
        .click();
      cy.get("button").contains("Requires").click();
      cy.get('[aria-label="ResourceRequires-Success"]', { timeout: 20000 }).should(($table) => {
        // 2 requirement rows + 1 header row
        expect($table.find("tr")).to.have.length(3);
      });
      cy.get("button").contains(requireA).should("exist");
      cy.get("button").contains(requireB).should("exist");

      // History tab should have 2 entries, one of which has 2 requires
      cy.get("button").contains("History").click();
      cy.get('[aria-label="Resource History Table Row"]').should("have.length", 2);
      cy.get('[data-label="Requires"]').contains("2").should("exist");

      // Navigate to requireA from the requires tab and verify landing page
      cy.get("button").contains("Requires").click();
      cy.get("button").contains(requireA).click();
      cy.get(`[aria-label="resourceName-${requireA}"]`).should("be.visible");

      // Go back and verify navigation works a second time
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Resources").click();
      cy.contains('[aria-label="Resource Table Row"]', resourceName)
        .find("button")
        .contains("Show Details")
        .click();
      cy.get("button").contains("Requires").click();
      cy.get("button").contains(requireA).click();
      cy.get(`[aria-label="resourceName-${requireA}"]`).should("be.visible");
    });

    it("6.5 Pagination", () => {
      cy.visit("/console/");
      cy.get('[aria-label="Select-environment-test"]').click();

      // Add a resource-states instance with scale=2 to get enough resources for pagination
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#resource-states").contains("Show inventory").click();
      cy.get("#add-instance-button").click();
      cy.get("#name").type("pagination-test");
      cy.get("#scale").clear().type("3");
      cy.get("button").contains("Confirm").click();

      cy.get('[aria-label="Instance-Details-Success"]', { timeout: 20000 }).should("be.visible");
      cy.get('[aria-label="CompileReportsIndication"]', { timeout: 90000 }).should("not.exist");

      // Verify that we now have at least 100 resources
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Resources").click();
      cy.get('[aria-label="Resource Table Row"]', { timeout: 80000 }).should(
        "have.length.at.least",
        100
      );

      // Switch to page size 20 and verify we start on page 1
      cy.get("#PaginationWidget-top-top-toggle").click();
      cy.contains(".pf-v6-c-menu__list-item", "100").find("svg").should("exist"); // 100 is default
      cy.contains(".pf-v6-c-menu__list-item", "20").click();
      cy.get(
        "#PaginationWidget-top-top-toggle > .pf-v6-c-menu-toggle__text > b:first-of-type"
      ).should("have.text", "1 - 20");
      cy.get('[aria-label="ResourcesPage-Success"]').should("be.visible");

      // Navigate forward two pages and back one, verifying page indicators
      cy.get('[aria-label="Go to next page"]').first().should("not.be.disabled").click();
      cy.get('[aria-label="ResourcesPage-Success"]').should("be.visible");
      cy.get("#PaginationWidget-top-top-toggle > .pf-v6-c-menu-toggle__text > b:first-of-type", {
        timeout: 20000,
      }).should("have.text", "21 - 40");

      cy.get('[aria-label="Go to next page"]').first().should("not.be.disabled").click();
      cy.get('[aria-label="ResourcesPage-Success"]').should("be.visible");
      cy.get("#PaginationWidget-top-top-toggle > .pf-v6-c-menu-toggle__text > b:first-of-type", {
        timeout: 20000,
      }).should("have.text", "41 - 60");

      cy.get('[aria-label="Go to previous page"]').first().should("not.be.disabled").click();
      cy.get('[aria-label="ResourcesPage-Success"]').should("be.visible");
      cy.get("#PaginationWidget-top-top-toggle > .pf-v6-c-menu-toggle__text > b:first-of-type", {
        timeout: 20000,
      }).should("have.text", "21 - 40");

      // Changing sort order should redirect back to page 1
      cy.get("button").contains("Type").click();
      cy.get("#PaginationWidget-top-top-toggle > .pf-v6-c-menu-toggle__text > b:first-of-type", {
        timeout: 20000,
      }).should("have.text", "1 - 20");

      // Changing filter should also redirect back to page 1
      cy.get('[aria-label="Go to next page"]').first().should("not.be.disabled").click();
      cy.get('[aria-label="ResourcesPage-Success"]').should("be.visible");
      cy.get("#PaginationWidget-top-top-toggle > .pf-v6-c-menu-toggle__text > b:first-of-type", {
        timeout: 20000,
      }).should("have.text", "21 - 40");

      cy.get('[aria-label="Resources-toolbar"]').find("button[aria-pressed]").click();
      // Filtering on type input with "lsm" will return 2 results
      cy.get('[aria-label="Type"]').type("lsm");
      cy.get('[aria-label="Add filter-Type"]').click();
      cy.get("#PaginationWidget-top-top-toggle > .pf-v6-c-menu-toggle__text > b:first-of-type", {
        timeout: 20000,
      }).should("have.text", "1 - 2");
    });

    it("6.6 Compound resource status legend", () => {
      cy.visit("/console/");
      cy.get('[aria-label="Select-environment-test"]').click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Resources").click();
      cy.get('[aria-label="ResourcesPage-Success"]').should("be.visible");

      // Verify legend bar renders with items that have numeric values
      cy.get('[data-testid="legend-bar-items"]').should("be.visible");
      cy.get('[data-testid="legend-bar-items"]')
        .find('[aria-label^="LegendItem-"]')
        .should("have.length.at.least", 1)
        .each(($item) => {
          expect(parseInt($item.attr("data-value"), 10)).to.be.a("number");
        });

      // Verify the not_blocked item has resources from previous tests
      cy.get('[aria-label="LegendItem-not_blocked"]')
        .should("be.visible")
        .invoke("attr", "data-value")
        .then((value) => {
          expect(parseInt(value, 10)).to.be.greaterThan(0);
        });

      // Store initial count, apply a legend filter and verify table shrinks
      cy.get('[aria-label="Resource Table Row"]').then(($rows) => {
        cy.wrap($rows.length).as("initialRowCount");
      });

      cy.get('[aria-label="LegendItem-compliant"]').click();
      cy.get('[aria-label="ResourcesPage-Success"]').should("be.visible");
      expectFilteredLessThan("initialRowCount");

      // Remove filters via the filter drawer and verify count is restored
      cy.get('[aria-label="Resources-toolbar"]').find("button[aria-pressed]").click();
      cy.get('[aria-label="Close compliant"]').click();
      cy.get('[aria-label="ResourcesPage-Success"]').should("be.visible");
      expectRowCountRestored("initialRowCount");
    });

    it("6.7 Resource filters", () => {
      cy.visit("/console/");
      cy.get('[aria-label="Select-environment-test"]').click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Resources").click();
      cy.get('[aria-label="ResourcesPage-Success"]').should("be.visible");

      // Store initial row count
      cy.get('[aria-label="Resource Table Row"]').then(($rows) => {
        cy.wrap($rows.length).as("initialRowCount");
      });

      // Open the filter drawer
      cy.get('[aria-label="Resources-toolbar"]').find("button[aria-pressed]").click();

      // --- Resource tab ---

      // Type filter
      cy.get('[aria-label="Type"]').type("lsm");
      cy.get('[aria-label="Add filter-Type"]').click();
      expectFilteredLessThan("initialRowCount");
      cy.get('[aria-label="Close lsm"]').click();
      expectRowCountRestored("initialRowCount");

      // Value filter
      cy.get('[aria-label="Value"]').type("test-compliant-successful-not-blocked-0");
      cy.get('[aria-label="Add filter-Value"]').click();
      // 2 matches expected since we added the same instance name twice across tests
      cy.get('[aria-label="Resource Table Row"]').should("have.length", 2);
      cy.get('[aria-label="Close test-compliant-successful-not-blocked-0"]').click();
      expectRowCountRestored("initialRowCount");

      // Agent filter - first verify infinite scroll loads more options
      cy.get('[aria-label="Agent(s)-menuToggle"]').click();
      cy.get('[aria-label="Agent(s) options"]')
        .find("button")
        .then(($buttons) => {
          cy.wrap($buttons.length).as("initialOptionCount");
        });
      cy.get('[aria-label="Agent(s) options"]').scrollTo("bottom");
      cy.get("@initialOptionCount").then((initialOptionCount) => {
        cy.get('[aria-label="Agent(s) options"]')
          .find("button")
          .should(($buttons) => {
            expect($buttons.length).to.be.greaterThan(initialOptionCount);
          });
      });

      // Add button should be disabled until an agent is selected
      cy.get('[aria-label="Add filter-Agent(s)"]').should("be.disabled");
      cy.get('[aria-label="Agent(s)-input"]').type("lsm");
      cy.get('[aria-label="Agent(s) options"]').contains("button", "lsm").click();
      cy.get('[aria-label="Add filter-Agent(s)"]').should("not.be.disabled").click();
      expectFilteredLessThan("initialRowCount");
      cy.get('[aria-label="Close lsm"]').click();
      expectRowCountRestored("initialRowCount");

      // Purged filter
      cy.get("button").contains("Resource").click();
      cy.get('[aria-label="Purged"]').click();
      expectFilteredLessThan("initialRowCount");
      cy.get('[aria-label="Close purged"]').click();
      expectRowCountRestored("initialRowCount");

      // --- Status tab ---
      cy.get('[role="tab"]').contains("Status").click();

      // Blocked state filter
      cy.get('[aria-label="Blocked state(s)-toggle"]').click();
      cy.get('[aria-label="blocked-include-toggle"]').click();
      cy.get('[aria-label="Blocked state(s)-toggle"]').click();
      expectFilteredLessThan("initialRowCount");
      cy.get('[aria-label="Close blocked"]').click();
      expectRowCountRestored("initialRowCount");

      // Compliance state filter
      cy.get('[aria-label="Compliance state(s)-toggle"]').click();
      cy.get('[aria-label="compliant-include-toggle"]').click();
      cy.get('[aria-label="Compliance state(s)-toggle"]').click();
      expectFilteredLessThan("initialRowCount");
      cy.get('[aria-label="Close compliant"]').click();
      expectRowCountRestored("initialRowCount");

      // Handler run state filter
      cy.get('[aria-label="Handler run state(s)-toggle"]').click();
      cy.get('[aria-label="failed-include-toggle"]').click();
      cy.get('[aria-label="Handler run state(s)-toggle"]').click();
      expectFilteredLessThan("initialRowCount");
      cy.get('[aria-label="Close failed"]').click();
      expectRowCountRestored("initialRowCount");

      // Is Deploying toggle filter
      cy.get('[aria-label="Is Deploying"]').click();
      expectFilteredLessThan("initialRowCount");
      cy.get('[aria-label="Close isDeploying"]').click();
      expectRowCountRestored("initialRowCount");
    });

    it("6.8 Resource sorting", () => {
      cy.visit("/console/");
      cy.get('[aria-label="Select-environment-test"]').click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Resources").click();
      cy.get('[aria-label="ResourcesPage-Success"]').should("be.visible");

      // --- Regular column sorting ---

      // Default sort is resource_type asc — clicking it should switch to desc
      cy.get("button").contains("Type").click();
      cy.get('[aria-label="ResourcesPage-Success"]').should("be.visible");
      cy.get('[data-testid="sort-Type"]').should("have.attr", "aria-sort", "descending");

      // Clicking again should switch back to asc
      cy.get("button").contains("Type").click();
      cy.get('[aria-label="ResourcesPage-Success"]').should("be.visible");
      cy.get('[data-testid="sort-Type"]').should("have.attr", "aria-sort", "ascending");

      // Clicking a different column should move the active sort
      cy.get("button").contains("Agent").click();
      cy.get('[aria-label="ResourcesPage-Success"]').should("be.visible");
      cy.get('[data-testid="sort-Agent"]').should("have.attr", "aria-sort", "ascending");
      cy.get('[data-testid="sort-Type"]').should("not.have.attr", "aria-sort");

      // Sorting resets pagination to page 1
      cy.get('[aria-label="Go to next page"]').first().click();
      cy.get('[aria-label="ResourcesPage-Success"]').should("be.visible");
      // Page 2 with 100 per page would show "101 - 102" or similar
      cy.get("#PaginationWidget-top-top-toggle > .pf-v6-c-menu-toggle__text > b:first-of-type", {
        timeout: 20000,
      }).should("not.have.text", "1 - 100");

      cy.get("button").contains("Type").click();
      cy.get('[aria-label="ResourcesPage-Success"]').should("be.visible");
      cy.get("#PaginationWidget-top-top-toggle > .pf-v6-c-menu-toggle__text > b:first-of-type", {
        timeout: 20000,
      }).should("have.text", "1 - 100");

      // --- Status sort menu ---

      // Badge should start at 0
      cy.get('[aria-label="Sort by status fields"]').within(() => {
        cy.get('[data-testid="status-sort-badge"]').should("have.text", "0");
      });

      // Open the status sort menu
      cy.get('[aria-label="Sort by status fields"]').click();
      cy.get('[data-testid="status-sort-menu"]').should("be.visible");

      // Activate "Blocked" — badge should increment to 1
      cy.get('[data-testid="status-sort-menu"]').contains("Blocked").click();
      cy.get('[data-testid="status-sort-badge"]').should("have.text", "1");
      cy.get('[aria-label="ResourcesPage-Success"]').should("be.visible");

      // Activate "Compliance" — badge should increment to 2
      cy.get('[data-testid="status-sort-menu"]').contains("Compliance").click();
      cy.get('[data-testid="status-sort-badge"]').should("have.text", "2");
      cy.get('[aria-label="ResourcesPage-Success"]').should("be.visible");

      // Both active items should appear in the draggable section
      cy.get('[data-testid="status-sort-active-list"]').within(() => {
        cy.get('[data-testid="status-sort-item"]').should("have.length", 2);
        cy.get('[data-testid="status-sort-item"]').eq(0).should("contain", "Blocked");
        cy.get('[data-testid="status-sort-item"]').eq(1).should("contain", "Compliance");
      });

      // Clicking an active item toggles its direction (asc → desc)
      cy.get('[data-testid="status-sort-active-list"]')
        .contains('[data-testid="status-sort-item"]', "Blocked")
        .click();
      cy.get('[aria-label="ResourcesPage-Success"]').should("be.visible");
      cy.get('[data-testid="status-sort-active-list"]')
        .contains('[data-testid="status-sort-item"]', "Blocked")
        .find('[data-testid="sort-direction-icon"]')
        .should("have.attr", "data-direction", "desc");

      // Clicking again removes it — badge decrements to 1
      cy.get('[data-testid="status-sort-active-list"]')
        .contains('[data-testid="status-sort-item"]', "Blocked")
        .click();
      cy.get('[data-testid="status-sort-badge"]').should("have.text", "1");
      cy.get('[data-testid="status-sort-active-list"]').within(() => {
        cy.get('[data-testid="status-sort-item"]').should("have.length", 1);
      });
    });
  } else {
    it("6.2 Resources for OSS", () => {
      cy.visit("/console/");
      cy.get('[aria-label="Select-environment-test"]').click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Resources").click();

      // Expect exactly 5 resources, all of type frontend_model::TestResource
      cy.get('[aria-label="Resource Table Row"]', { timeout: 30000 }).should("have.length", 5);
      cy.get('[aria-label="Resource Table Row"]').each(($row) => {
        cy.wrap($row).should("contain", "frontend_model::TestResource");
      });

      // Navigate to the first resource details
      cy.get('[aria-label="Resource Table Row"]')
        .first()
        .find("button")
        .contains("Show Details")
        .click();

      const expectedAttributes = {
        name: "a",
        purge_on_delete: "false",
        purged: "false",
        receive_events: "true",
        send_event: "true",
        should_deploy_fail: "false",
      };

      Object.entries(expectedAttributes).forEach(([key, value]) => {
        cy.get(`[data-testid="attribute-${key}"]`).should("contain", value);
      });

      // Requires tab should be empty
      cy.get("button").contains("Requires").click();
      cy.get('[aria-label="ResourceRequires-Empty"]').should("contain", "No requirements found");

      // History tab should have 1 entry with 0 requires, expand and verify same attributes
      cy.get("button").contains("History").click();
      cy.get('[aria-label="Resource History Table Row"]').should("have.length", 1);
      cy.get('[data-label="Requires"]').should("contain", "0");
      cy.get('[aria-label="Details"]').click();

      Object.entries(expectedAttributes).forEach(([key, value]) => {
        cy.get(`[data-testid="attribute-${key}"]`).should("contain", value);
      });

      cy.get("button").contains("Requires").click();
      cy.get('[aria-label="ResourceRequires-Empty"]').should("contain", "No requirements found");

      // Logs tab should have at least 5 messages with 100 as default page size
      cy.get("button").contains("Logs").click();
      cy.get('[aria-label="ResourceLogRow"]', { timeout: 40000 }).should("have.length.at.least", 4);
      cy.get('[id="PaginationWidget-top-top-toggle"]').click();
      cy.get('[data-action="per-page-100"]').should("contain", "100");
      cy.get('[data-action="per-page-100"]').find("svg").should("exist");

      // Most recent log should reference a stored version (oldest entry, sorted descending)
      cy.get('[aria-label="ResourceLogRow"]')
        .last()
        .should("contain", "Successfully stored version");
      cy.get('[aria-label="Details"]').last().click();
      cy.contains("Successfully stored version").should("be.visible");
    });
  }
});
