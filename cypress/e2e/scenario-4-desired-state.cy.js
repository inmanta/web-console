import environmentHelpers from "../support/environmentHelpers";

const { clearEnvironment, forceUpdateEnvironment } = environmentHelpers;

const isIso = Cypress.expose("edition") === "iso";

describe("Scenario 4 Desired State", () => {
  if (isIso) {
    before(() => {
      clearEnvironment();
      forceUpdateEnvironment();
    });
  }

  it("4.1 Initial setup", () => {
    // Go from Home page to Service Inventory of Basic-service
    cy.visit("/console/");
    cy.get('[aria-label="Select-environment-test"]').click();

    if (isIso) {
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#basic-service").contains("Show inventory").click();
      cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");

      // Add an instance and fill form
      cy.get("#add-instance-button").click();
      cy.get("#ip_r1").type("1.2.3.4");
      cy.get("#interface_r1_name").type("eth0");
      cy.get("#address_r1").type("1.2.3.5/32");
      cy.get("#vlan_id_r1").type("1");

      cy.get("#ip_r2").type("1.2.2.1");
      cy.get("#interface_r2_name").type("interface-vlan");
      cy.get("#address_r2").type("1.2.2.3/32");
      cy.get("#vlan_id_r2").type("2");
      cy.get("#service_id").type("0001");
      cy.get("#name").type("basic-service");
      cy.get("button").contains("Confirm").click();

      cy.get('[aria-label="Instance-Details-Success"]', {
        timeout: 20000,
      }).should("to.be.visible");

      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#basic-service").contains("Show inventory").click();

      // Should show the chart
      cy.get(".pf-v6-c-chart").should("be.visible");

      // Should show the ServiceInventory-Success Component.
      cy.get('[aria-label="ServiceInventory-Success"]').should("to.be.visible");
      // Check if only one row has been added to the table.
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);
    }

    //got to desired stated page
    cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Desired State").click();

    if (!isIso) {
      // Hit the compile button; OSS don't get compiled on initial state.
      // TODO : Add cleanup of previous test runs. For now we need to manually delete the content of the desired state table to have a fresh start.
      cy.get("button", { timeout: 60000 }).contains("Recompile").click();

      cy.get('[aria-label="DesiredStatesView-Success"]', { timeout: 80000 })
        .find("tbody")
        .eq(0)
        .should("contain", "console")
        .and("contain", "active")
        .and("contain", "a few seconds ago");

      cy.get('[aria-label="DesiredStatesView-Success"]')
        .find("tbody", { timeout: 20000 })
        .then(($tbody) => {
          cy.wrap($tbody.length).as("TABLE_LENGTH");
        });
    } else {
      cy.get('[aria-label="DesiredStatesView-Success"]', { timeout: 60000 })
        .find("tbody", { timeout: 60000 })
        .should("have.length", 3);
      cy.get("tbody").eq(0).should("contain", "lsm_export").and("contain", "active");

      cy.wrap(3).as("TABLE_LENGTH");
    }

    cy.get('[data-label="Status"]').contains("active").should("have.length", 1);

    // Go from desired State to Resources
    cy.get("tbody").eq(0).contains("Show Resources").click();
    cy.get('[aria-label="VersionResourcesTable-Success"]')
      .find("tbody")
      .should("have.length", isIso ? 2 : 5);

    cy.get("tbody").eq(0).should("contain", "frontend_model::TestResource").and("contain", "0");

    if (isIso) {
      cy.get("tbody").eq(1).should("contain", "lsm::LifecycleTransfer").and("contain", "1");
    }

    // Open filter drawer and filter on value : default to have same table on iso and oss
    cy.contains("button", "Filters").click();
    cy.get('[aria-label="Value"]').type("default{enter}");

    // go to details of first resource
    cy.get("tbody").eq(0).contains("Show Details").click();
    cy.get(".pf-v6-c-content--small").should(
      "have.text",
      "frontend_model::TestResource[internal,name=default-0001]"
    );

    // Intercept the update filter call to make sure it is cleared before setting a new filter to avoid race condition.
    cy.intercept({
      method: "GET",
      url: /.*\/?limit=20&sort=resource_type.asc/,
    }).as("FILTER_UPDATE");

    // Go back and open details of second resource
    cy.get('[aria-label="BreadcrumbItem"]').contains("Details").click();

    // Open filter drawer and clear the filter
    cy.contains("button", "Filters", { timeout: 30000 }).click();
    cy.contains("button", "Clear all").click();

    cy.wait("@FILTER_UPDATE");

    // Update the filter to retrieve the right resource for lsm
    if (isIso) {
      // filter on type : lsm to have same table on iso and oss
      cy.get('[aria-label="Type"]').type("lsm{enter}");

      cy.wait("@FILTER_UPDATE");

      cy.get("tbody").eq(0).contains("Show Details").click();

      // Check all values in the description list
      cy.get(".pf-v6-c-description-list").within(() => {
        cy.get(".pf-v6-c-description-list__term")
          .contains("next_desired_state_version")
          .closest(".pf-v6-c-description-list__group")
          .find(".pf-v6-c-description-list__description")
          .should("have.text", "4");

        cy.get(".pf-v6-c-description-list__term")
          .contains("next_version")
          .closest(".pf-v6-c-description-list__group")
          .find(".pf-v6-c-description-list__description")
          .should("have.text", "4");

        cy.get(".pf-v6-c-description-list__term")
          .contains("purge_on_delete")
          .closest(".pf-v6-c-description-list__group")
          .find(".pf-v6-c-description-list__description")
          .should("have.text", "false");

        cy.get(".pf-v6-c-description-list__term")
          .contains("purged")
          .closest(".pf-v6-c-description-list__group")
          .find(".pf-v6-c-description-list__description")
          .should("have.text", "false");

        cy.get(".pf-v6-c-description-list__term")
          .contains("receive_events")
          .closest(".pf-v6-c-description-list__group")
          .find(".pf-v6-c-description-list__description")
          .should("include.text", "true");

        cy.get(".pf-v6-c-description-list__term")
          .contains("requires")
          .closest(".pf-v6-c-description-list__group")
          .find(".pf-v6-c-description-list__description")
          .should("include.text", "frontend_model::TestResource[internal,name=default-0001]");

        cy.get(".pf-v6-c-description-list__term")
          .contains("resources")
          .closest(".pf-v6-c-description-list__group")
          .find(".pf-v6-c-description-list__description")
          .should("include.text", '"frontend_model::TestResource[internal,name=default-0001]"');

        cy.get(".pf-v6-c-description-list__term")
          .contains("service_entity")
          .closest(".pf-v6-c-description-list__group")
          .find(".pf-v6-c-description-list__description")
          .should("have.text", "basic-service");
      });
    }

    // Go back to the Desired State page.
    cy.get('[aria-label="BreadcrumbItem"]').contains("Desired State").click();

    // For OSS, we need to recompile to actually have at least one retired version.
    if (!isIso) {
      cy.get("button", { timeout: 50000 }).contains("Recompile").click();

      cy.get("@TABLE_LENGTH").then((length) => {
        cy.get("tbody", { timeout: 50000 }).should("have.length", length + 1);
      });
    }

    // Delete the retired version.
    cy.get("tbody").eq(1).find('[aria-label="actions-toggle"]').click();
    cy.get('[role="menuitem"]').contains("Delete").click();
    cy.get("#cancel").click();

    cy.get("@TABLE_LENGTH").then((length) => {
      cy.get("tbody", { timeout: 30000 }).should("have.length", isIso ? length : length + 1);
    });

    cy.get("tbody").eq(1).find('[aria-label="actions-toggle"]').click();
    cy.get('[role="menuitem"]').contains("Delete").click();
    cy.get("#submit").click();

    // The active version should remain in the table.
    cy.get("@TABLE_LENGTH").then((length) => {
      cy.get("tbody", { timeout: 30000 }).should("have.length", isIso ? length - 1 : length);
    });

    cy.get("tbody").eq(0).find('[data-label="Status"]').should("have.text", "active");

    // Recompile to get at least one older version ready to promote.
    cy.get("button", { timeout: 60000 }).contains("Recompile").click();

    cy.get("@TABLE_LENGTH").then((length) => {
      cy.get("tbody", { timeout: 30000 }).should("have.length", isIso ? length : length + 1);

      // the first element in the table shouldn't be available to promote, since it is already active.
      cy.get("tbody").eq(0).find('[aria-label="actions-toggle"]').click();
      cy.get('[data-testid="promote"]').find("button").should("be.disabled");
    });

    // Update the settings to disable the auto-deploy setting.
    cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Settings").click();
    cy.get(".pf-v6-c-tabs__link").contains("Configuration").click();
    cy.get('[aria-label="Row-auto_deploy"]').find(".pf-v6-c-switch").click();
    cy.get('[aria-label="Row-auto_deploy"]').find('[aria-label="SaveAction"]').click();

    // Go back to the desired state page.
    cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Desired State").click();

    // Recompile, to get a candidate version.
    cy.get("button", { timeout: 30000 }).contains("Recompile").click();

    cy.get("@TABLE_LENGTH").then((length) => {
      cy.get("tbody", { timeout: 30000 }).should("have.length", length + 1);

      cy.get("tbody")
        .eq(0)
        .find('[data-label="Status"]', { timeout: 30000 })
        .should("have.text", "candidate");

      cy.get("tbody").eq(0).find('[aria-label="actions-toggle"]').click();
      cy.get('[role="menuitem"]').contains("Promote").click();
      cy.get("tbody").eq(0).find('[data-label="Status"]').should("have.text", "active");

      cy.get("tbody").eq(1).find('[data-label="Status"]').should("have.text", "retired");
    });

    // Turn back the auto-deploy setting to true.
    cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Settings").click();
    cy.get(".pf-v6-c-tabs__link").contains("Configuration").click();
    cy.get('[aria-label="Row-auto_deploy"]').find(".pf-v6-c-switch").click();
    cy.get('[aria-label="Row-auto_deploy"]').find('[aria-label="SaveAction"]').click();

    // Get back to the Desired State page.
    cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Desired State").click();

    cy.get("tbody").eq(0).find('[aria-label="actions-toggle"]').click();
    cy.get('[role="menuitem"]').contains("Select for compare").click();
    cy.get("tbody").eq(1).find('[aria-label="actions-toggle"]').click();
    cy.get('[role="menuitem"]').contains("Compare with selected").click();
    cy.get("h1").eq(0).should("have.text", "Compare");
    //go back
    cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Desired State").click();

    cy.get("tbody")
      .eq(isIso ? -2 : -1)
      .find('[aria-label="actions-toggle"]')
      .click();

    cy.get('[role="menuitem"]').contains("Compare with current state").click();

    cy.get("h1").should("have.text", "Compliance Check");
    cy.get('[aria-label="ReportListSelect"]').contains("No Dry runs exist").should("be.visible");
    cy.get(".pf-v6-c-button").contains("Perform dry run").click();

    cy.get('[aria-label="StatusFilter"]').click();
    cy.get('[role="option"]').contains("unmodified").click();
    cy.get('[aria-label="StatusFilter"]').click();

    cy.get('[aria-label="DiffItemList"]', { timeout: 20000 }).should("be.visible");

    // dynamically click all details rows
    cy.get('[aria-label="Details"]', { timeout: 20000 })
      .should("have.length", isIso ? 2 : 5)
      .then(($details) => {
        const detailsCount = $details.length;

        $details.each((_i, el) => {
          cy.wrap(el).click();
        });

        // dynamically assert expandable content matches number of details
        cy.get(".pf-v6-c-card__expandable-content").should(($rows) => {
          expect($rows.length).to.equal(detailsCount);

          $rows.each((_i, row) => {
            expect(row).to.have.text("This resource has not been modified.");
          });
        });
      });

    // go back to desired state page
    cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Desired State").click();

    // click on version latest kebab menu
    cy.get("tbody").eq(0).find('[aria-label="actions-toggle"]').click();

    // select Compare with current state
    cy.get('[role="menuitem"]').contains("Compare with current state").click();

    // expect to land on compliance check page
    cy.get("h1").should("have.text", "Compliance Check");

    // Expect diff-module to be empty
    cy.get(".pf-v6-c-page__main-section").eq(1).children().should("have.length", 1);

    cy.get('[aria-label="ReportListSelect"]').contains("No Dry runs exist").should("be.visible");

    // perform dry-run
    cy.get(".pf-v6-c-button").contains("Perform dry run").click();

    cy.get('[aria-label="StatusFilter"]').click();
    cy.get('[role="option"]').contains("unmodified").click();
    cy.get('[aria-label="StatusFilter"]').click();

    // dynamically expand all detail rows again
    cy.get('[aria-label="Details"]', { timeout: 20000 })
      .should("have.length", isIso ? 2 : 5)
      .then(($details) => {
        const detailsCount = $details.length;
        $details.each((_i, el) => cy.wrap(el).click());

        cy.get(".pf-v6-c-card__expandable-content").should(($rows) => {
          expect($rows.length).to.equal(detailsCount);
          $rows.each((_i, row) => expect(row).to.have.text("This resource has not been modified."));
        });
      });

    // click on filter by status dropdown
    cy.get('[aria-label="StatusFilter"]').click();

    // uncheck unmodified option
    cy.get('[role="option"]').contains("unmodified").click();
    cy.get('[aria-label="StatusFilter"]').click();

    // go back to desired state
    cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Desired State").click();

    // click again on kebab menu of version 5
    cy.get("tbody").eq(0).find('[aria-label="actions-toggle"]').click();

    // select again compare with current state
    cy.get('[role="menuitem"]').contains("Compare with current state").click();

    cy.get('[aria-label="StatusFilter"]').click();
    cy.get('[role="option"]').contains("unmodified").click();
    cy.get('[aria-label="StatusFilter"]').click();

    // dynamically expand all details inside DiffItemList
    cy.get('[aria-label="DiffItemList"]', { timeout: 20000 }).within(() => {
      cy.get('[aria-label="Details"]')
        .should("have.length", isIso ? 2 : 5)
        .then(($details) => {
          const detailsCount = $details.length;

          // click every Details row
          $details.each((_i, el) => cy.wrap(el).click());

          // dynamically assert expandable content matches number of details
          cy.get(".pf-v6-c-card__expandable-content").should(($rows) => {
            expect($rows.length).to.equal(detailsCount);
            $rows.each((_i, row) => {
              expect(row).to.have.text("This resource has not been modified.");
            });
          });
        });
    });

    // click on Perform dry run
    cy.get(".pf-v6-c-button").contains("Perform dry run").click();

    // click on the dropdown containing the different dry-runs
    cy.get('[aria-label="ReportListSelect"]').click();

    // expect it to have 2 options.
    cy.get('[aria-label="ReportList"]').find("li").should("have.length", 2);

    // go back to Home.
    cy.visit("/console/");
  });
});
