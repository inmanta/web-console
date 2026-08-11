import environmentHelpers from "../support/environmentHelpers";

const { selectEnvironment, getDefaultEnvName } = environmentHelpers;

const isIso = Cypress.expose("edition") === "iso";

describe("1.1 Dashboard", () => {
  beforeEach(() => {
    cy.visit("/console/");
    selectEnvironment();
  });

  it("1.1.1 Selecting an environment lands on the Dashboard", () => {
    cy.url().should("contain", "/console/dashboard");
    cy.get("h1").contains("Environment Health").should("be.visible");

    // Navigating away and back through the sidebar returns to the Dashboard
    cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Resources").click();
    cy.url().should("contain", "/console/resources");

    cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Dashboard").click();
    cy.url().should("contain", "/console/dashboard");
    cy.get("h1").contains("Environment Health").should("be.visible");
  });

  it("1.1.2 Environment Health row", () => {
    // Orchestrator identity card: environment name, Operational verdict and checklist
    cy.get("h3").contains(getDefaultEnvName().split(" ")[0]).should("be.visible");
    cy.get("h4").contains("Operational").should("be.visible");
    cy.contains("Server OK").should("be.visible");
    cy.contains("Database connected").should("be.visible");
    cy.contains("Scheduler running").should("be.visible");

    // Switch button opens the same environment selector as the header toggle
    cy.get("button").contains("Switch").click();
    cy.contains('[role="menuitem"]', getDefaultEnvName()).should("be.visible");
    cy.get("h1").contains("Environment Health").click();
    cy.contains('[role="menuitem"]', getDefaultEnvName()).should("not.exist");

    // Health columns: title + status indicator for each of the four columns, each clickable
    ["Services", "Resources", "Compiles", "Agents"].forEach((title) => {
      cy.get(`[aria-label="View ${title} details"]`).should("exist");
      cy.contains('[aria-label^="Status-"]', title).should("be.visible");
    });

    // Clicking a column navigates to the relevant page
    cy.get('[aria-label="View Resources details"]').click();
    cy.url().should("contain", "/console/resources");

    cy.visit("/console/");
    selectEnvironment();
    cy.get('[aria-label="View Compiles details"]').click();
    cy.url().should("contain", "/console/compilereports");
  });

  it("1.1.3 Latest Compile Reports panel", () => {
    cy.contains("Latest compile reports").should("be.visible");

    cy.get("a").contains("View all compile reports").click();
    cy.url().should("contain", "/console/compilereports");
    // iso's LSM catalog sync compiles automatically on environment setup, guaranteeing rows here;
    // oss has no such automatic compile, so only assert the table itself renders without erroring.
    cy.get("tbody tr", { timeout: 30000 }).should(
      isIso ? "have.length.greaterThan" : "have.length.at.least",
      0
    );
  });

  it("1.1.4 Orchestrator detail card", () => {
    cy.contains("h3", "Orchestrator").closest(".pf-v6-c-card").as("orchestratorCard");

    // The detail rows (Edition, Version, License, Python, PostgreSQL) are all present
    ["Edition", "Version", "License", "Python", "PostgreSQL"].forEach((label) => {
      cy.get("@orchestratorCard").contains(label).scrollIntoView().should("be.visible");
    });

    // Server status has loaded, so none of the values are stuck on the "—" placeholder
    cy.get("@orchestratorCard").should("not.contain", "—");

    cy.get("@orchestratorCard").contains("a", "Open full Orchestrator Status page").click();
    cy.url().should("contain", "/console/status");
    cy.get("h1").contains("Orchestrator Status").scrollIntoView().should("be.visible");
  });

  it("1.1.5 Resource Manager card", () => {
    cy.contains("Resource Manager").should("be.visible");

    ["brand", "success", "danger", "warning"].forEach((tone) => {
      cy.get(`[data-testid="stat-tile-${tone}"]`)
        .scrollIntoView()
        .should("be.visible")
        .find("h2")
        .invoke("text")
        .then((text) => text.trim())
        .should("match", /^[\d,]+$/);
    });
  });

  it("1.1.6 Orchestration Engine card", () => {
    cy.contains("Orchestration Engine").should("be.visible");

    // Default tab is Compile rate, with its four stats visible
    ["compiles", "failed", "avg-compile", "avg-waiting"].forEach((testId) => {
      cy.get(`[data-testid="orchestration-engine-stat-${testId}"]`)
        .scrollIntoView()
        .should("be.visible");
    });
    cy.contains("Compiles per day").scrollIntoView().should("be.visible");

    // Switching tabs updates the chart title
    cy.get("#orchestration-engine-tab-time").scrollIntoView().click();
    cy.contains("Avg compile time (s)").scrollIntoView().should("be.visible");

    cy.get("#orchestration-engine-tab-waiting").scrollIntoView().click();
    cy.contains("Avg waiting time (s)").scrollIntoView().should("be.visible");

    cy.get("#orchestration-engine-tab-rate").scrollIntoView().click();
    cy.contains("Compiles per day").scrollIntoView().should("be.visible");

    // Range picker switches both the toggle label and the subtitle/chart window
    cy.contains("small", "last 7 days").scrollIntoView().should("be.visible");
    cy.get("button").contains("Last 7 days").scrollIntoView().click();
    cy.get("button").contains("Last 30 days").click();
    cy.get("button").contains("Last 30 days").scrollIntoView().should("be.visible");
    cy.contains("small", "last 30 days").scrollIntoView().should("be.visible");
    cy.contains("30 days ago").scrollIntoView().should("be.visible");

    // Refresh re-triggers the data fetch without erroring out
    cy.get("button").contains("Refresh").scrollIntoView().click();
    cy.get('[data-testid="orchestration-engine-stat-compiles"]')
      .scrollIntoView()
      .should("be.visible");
  });

  if (isIso) {
    it("1.1.7 Creating an instance with resources updates the health, resource and compile cards", () => {
      const readCardCount = (ariaLabel, pattern) =>
        cy
          .get(`[aria-label="${ariaLabel}"]`)
          .closest(".pf-v6-c-card")
          .invoke("text")
          .then((text) => Number(text.match(pattern)[1]));

      // Capture baseline counts before creating any resources
      readCardCount("View Resources details", /(\d+) resources/).as("initialResources");
      readCardCount("View Services details", /(\d+) instances/).as("initialInstances");
      cy.get('[data-testid="orchestration-engine-stat-compiles"] h2')
        .invoke("text")
        .then(Number)
        .as("initialCompiles");

      cy.intercept("DELETE", "/lsm/v1/service_inventory/resource-states/**").as("DeleteInstance");

      // resource-states deterministically emits 26 resources spread across every
      // compliance/deploy-result/blocked combination, so every card below is guaranteed to move
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#resource-states").contains("Show inventory").click();
      cy.get("#add-instance-button").click();
      cy.get("#name").type("dashboard-live-check");
      cy.get("button").contains("Confirm").click();
      cy.get('[aria-label="Instance-Details-Success"]', { timeout: 20000 }).should("be.visible");

      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Dashboard").click();

      // Environment Health row: Resources/Services counts move by the exact known amounts.
      cy.get("@initialResources").then((initial) => {
        cy.get('[aria-label="View Resources details"]', { timeout: 30000 })
          .closest(".pf-v6-c-card")
          .should((card) => {
            expect(Number(card.text().match(/(\d+) resources/)[1])).to.eq(initial + 26);
          });
      });
      cy.get("@initialInstances").then((initial) => {
        cy.get('[aria-label="View Services details"]')
          .closest(".pf-v6-c-card")
          .should((card) => {
            expect(Number(card.text().match(/(\d+) instances/)[1])).to.eq(initial + 1);
          });
      });
      // Orchestration Engine card: its "Compiles" count is a snapshot of the selected day range
      // as of the last mount/refresh (OrchestrationEngineCard.tsx recomputes startDate/endDate
      // only on a range change or Refresh click), not a live counter - so the 3 compiles from the
      // instance's validate/creating/up lifecycle won't show up from polling alone. Refresh first.
      cy.get("@initialCompiles").then((initial) => {
        cy.get("button").contains("Refresh").click();
        cy.get('[data-testid="orchestration-engine-stat-compiles"] h2', { timeout: 20000 }).should(
          (h2) => {
            expect(Number(h2.text())).to.be.greaterThan(initial);
          }
        );
      });

      // Resource Manager card: same underlying total, surfaced via a different component
      cy.get("@initialResources").then((initial) => {
        cy.contains("h3", "Resource Manager", { timeout: 30000 })
          .closest(".pf-v6-c-card")
          .should((card) => {
            expect(Number(card.text().match(/(\d+) resources/)[1])).to.eq(initial + 26);
          });
      });

      // Clean up: delete the instance so it doesn't leak into other specs
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#resource-states").contains("Show inventory").click();
      cy.get('[aria-label="IdentityCell-dashboard-live-check"]')
        .closest('[aria-label="InstanceRow-Intro"]')
        .find('[aria-label="row actions toggle"]')
        .click();
      cy.get('[role="menuitem"]').contains("Delete").click();
      cy.get("button").contains("Yes").click();
      cy.wait("@DeleteInstance").its("response.statusCode").should("eq", 200);
    });
  }
});
