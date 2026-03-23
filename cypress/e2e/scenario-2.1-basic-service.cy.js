import environmentHelpers from "../support/environmentHelpers";

const { clearEnvironment, forceUpdateEnvironment } = environmentHelpers;

beforeEach(() => {
  localStorage.setItem("theme-preference", "light");
});

const isIso = Cypress.expose("edition") === "iso";

if (isIso) {
  describe("Scenario 2.1 Service Catalog - basic-service", () => {
    before(() => {
      clearEnvironment();
      forceUpdateEnvironment();
    });

    it("2.1.1 Add Instance Cancel form", () => {
      // Go from Home page to Service Inventory of Basic-service
      cy.visit("/console/");

      cy.intercept(
        "GET",
        "/lsm/v1/service_inventory/basic-service?include_deployment_progress=True&limit=20&&sort=created_at.desc"
      ).as("GetServiceInventory");

      cy.get('[aria-label="Select-environment-test"]').click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#basic-service").contains("Show inventory").click();

      // make sure the call to get inventory has been executed
      cy.wait("@GetServiceInventory");
      cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");

      // Add an instance and fill form
      cy.get("#add-instance-button").click();
      cy.get("#ip_r1").type("1.2.3.4");
      cy.get("#interface_r1_name").type("eth0");
      cy.get("#address_r1").type("1.2.3.5");
      cy.get("#vlan_id_r1").type("1");
      cy.get("#ip_r2").type("1.2.2.1");
      cy.get("#interface_r2_name").type("interface-vlan");
      cy.get("#address_r2").type("1.2.2.3");
      cy.get("#vlan_id_r2").type("2");
      cy.get("#service_id").type("0001");
      cy.get("#name").type("basic-service");
      cy.get("button").contains("Cancel").click();

      // make sure the call to get inventory has been executed
      cy.wait("@GetServiceInventory");

      // check if the view is still empty, also means we have been redirected as expected.
      cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");
    });

    it("2.1.2 Add Instance Submit form, INVALID form, EDIT form, VALID form", () => {
      // Go from Home page to Service Inventory of Basic-service
      cy.visit("/console/");
      cy.get('[aria-label="Select-environment-test"]').click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#basic-service").contains("Show inventory").click();
      cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");

      // Add an instance and fill form
      cy.get("#add-instance-button").click();
      cy.get("#ip_r1").type("1.2.3.4");
      cy.get("#interface_r1_name").type("eth0");
      cy.get("#address_r1").type("1.2.3.5/32");
      cy.get("#vlan_id_r1").type("1");

      // This is an incorrect value for ip_r2
      cy.get("#ip_r2").type("1.2.2.1/32");
      cy.get("#interface_r2_name").type("interface-vlan");
      cy.get("#address_r2").type("1.2.2.3/32");
      cy.get("#vlan_id_r2").type("2");
      cy.get("#service_id").type("0001");
      cy.get("#name").type("basic-service");
      cy.get("button").contains("Confirm").click();

      // expect an error toast
      cy.get(".pf-m-danger").should("be.visible");

      // fix input that has a wrong value and submit
      cy.get("#ip_r2").clear().type("1.2.2.1");
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

      // check whether there are two options available in the dropdown to copy the id/identifier.
      cy.get('[aria-label="IdentityCell-basic-service"]').within(() => {
        cy.get('[aria-label="Copy to clipboard"]').click();
      });

      cy.get('[role="menuitem"]').should("have.length", 2);
    });

    it("2.1.3 Edit previously created instance, Instance Details history, documentation tab", () => {
      cy.visit("/console/");
      cy.get('[aria-label="Select-environment-test"]').click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      // Expect to find one badge on the basic-service row.
      cy.get("#basic-service")
        .get('[aria-label="Number of instances by label"]')
        .children()
        .should("have.length", 1);
      cy.get("#basic-service").contains("Show inventory").click();

      // Check Instance Details page
      // The first button should be the one redirecting to the details page.
      cy.get('[aria-label="instance-details-link"]').first().click();

      // Check if there are three versions in the history table
      cy.get('[aria-label="History-Row"]', { timeout: 60000 }).should("have.length", 3);

      // Check the state of the instance is up in the history section.
      cy.get('[aria-label="History-Row"]').eq(0).should("contain", "up");

      // Selecting a version in the table should change the tags in the heading of the page.
      cy.get('[id="version-2"]').trigger("click");
      cy.wait(1000);
      cy.get('[id="version-2"]').trigger("click");

      cy.get('[data-testid="selected-version"]', { timeout: 30000 }).should(
        "have.text",
        "Version: 2"
      );

      // Check if it has all correct tabs and that the default selected one is the documentation tab.
      cy.get('[aria-label="documentation-content"]').should("have.attr", "aria-selected", "true");
      cy.get('[aria-label="attributes-content"]').should("have.attr", "aria-selected", "false");
      cy.get('[aria-label="events-content"]').should("have.attr", "aria-selected", "false");
      cy.get('[aria-label="resources-content"]').should("have.attr", "aria-selected", "false");

      // check if the documentation is displayed
      cy.get(".markdown-body > h1").should("contain", "Getting started");

      // Go back to inventory using the breadcrumbs
      cy.get('[aria-label="BreadcrumbItem"]').contains("Service Inventory: basic-service").click();

      // click on edit button
      cy.get('[aria-label="row actions toggle"]', { timeout: 60000 }).click();

      // The fourth button in the dropdown should be the edit button.
      cy.get('[role="menuitem"]')
        .contains(/^Edit$/)
        .click();

      // check if amount of fields is lesser than create amount.
      cy.get("form").find("input").should("have.length.of.at.most", 11);

      // delete first value and submit should give an error toast
      cy.get("#address_r1").clear();
      cy.get("button").contains("Confirm").click();
      cy.get(".pf-m-danger").should("be.visible");

      // Fill in first value 1.2.3.8/32 and submit
      cy.get("#address_r1").type("1.2.3.8/32");
      cy.get("button").contains("Confirm").click();

      // check attributes on instance details page
      cy.get(".pf-v6-c-tabs__list").contains("Attributes").click();

      // Expect to find new value as candidate and old value in active
      cy.get('[aria-label="address_r1_value"]').should("contain", "1.2.3.5/32");

      // change to candidate attribute set
      cy.get('[aria-label="Select-AttributeSet"]').select("candidate_attributes");

      cy.get('[aria-label="address_r1_value"]').should("contain", "1.2.3.8/32");
    });

    it("2.1.4 Duplicate instance with Editor", () => {
      cy.visit("/console/");
      cy.get('[aria-label="Select-environment-test"]').click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#basic-service").contains("Show inventory").click();

      // Record the current number of instances before duplicating
      cy.get('[aria-label="InstanceRow-Intro"]').its("length").as("previousCount");

      cy.get('[aria-label="row actions toggle"]', { timeout: 60000 }).eq(0).click();
      cy.get('[role="menuitem"]').contains("Duplicate").click();

      // toggle to JSON editor
      cy.get("#editorButton").click();

      // expect the JSON to be valid
      cy.get('[data-testid="Error-container"]').should("not.exist");

      // platform specific command to select all and delete the content of the editor
      const deleteShortcut =
        Cypress.platform === "darwin" ? "{meta+a}{backspace}" : "{ctrl+a}{backspace}";
      // delete the JSON entirely
      cy.get(".monaco-editor").click().focused().type(deleteShortcut);

      // expect the JSON to be invalid
      cy.get('[data-testid="Error-container"]').should("contain", "Errors found");

      // expect submit button to be disabled
      cy.get('[aria-label="submit"]').should("be.disabled");

      // expect Form button to be disabled
      cy.get("#formButton").should("be.disabled");

      // platform specific undo command to restore the JSON
      const undoShortcut = Cypress.platform === "darwin" ? "{meta+z}" : "{ctrl+z}";
      // ctrl+z to undo the deletion
      cy.get(".monaco-editor").click().focused().type(undoShortcut);

      // expect the JSON to be valid
      cy.get('[data-testid="Error-container"]').should("not.exist");

      // expect submit button to be enabled
      cy.get('[aria-label="submit"]').should("be.enabled");

      // expect Form button to be enabled
      cy.get("#formButton").should("be.enabled");

      // expect to be able to toggle back to the form and still have all correct values
      cy.get("#formButton").click();
      cy.get("#address_r1").should("have.value", "1.2.3.8/32");
      cy.get("#ip_r1").should("have.value", "1.2.3.4");
      cy.get("#name").type("-copy");

      // clear value and go back to editor
      cy.get("#address_r1").clear();
      cy.get("#editorButton").click();

      // expect the value for address_r1 to be empty
      cy.get(".view-line > :nth-child(1) > .mtk5").first().should("contain", '""');

      // empty value should be valid and allow going back to form.
      cy.get("#formButton").click();
      cy.get("#address_r1").type("1.2.3.2/32");

      // bo back to editor
      cy.get("#editorButton").click();

      // platform specific command to find the service_id field in the editor
      const searchToolShortcut = Cypress.platform === "darwin" ? "{meta+f}" : "{ctrl+f}";
      // change the service id to make instance unique
      cy.get(".monaco-editor").click().focused().type(searchToolShortcut);

      cy.wait(1000); // let the editor settle to avoid typing text to fail

      cy.get('[aria-label="Find"]').type("0001");

      // toggle replace option
      cy.get('[aria-label="Toggle Replace"]').click();
      // go to the replace field
      cy.get('[aria-label="Replace"]').type("0005{enter}{enter}");

      // submit
      cy.get("button").contains("Confirm").click();

      cy.get('[aria-label="Instance-Details-Success"]', {
        timeout: 20000,
      }).should("to.be.visible");

      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#basic-service").contains("Show inventory").click();

      // expect one more row in inventory than before the duplication
      cy.get("@previousCount").then((previousCount) => {
        cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", previousCount + 1);
      });
    });

    it("2.1.5 JSON editor invalid should disable buttons", () => {
      // Go from Home page to Service Inventory of Basic-service
      cy.visit("/console/");

      cy.intercept(
        "GET",
        "/lsm/v1/service_inventory/basic-service?include_deployment_progress=True&limit=20&&sort=created_at.desc"
      ).as("GetServiceInventory");

      cy.get('[aria-label="Select-environment-test"]').click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#basic-service").contains("Show inventory").click();

      // make sure the call to get inventory has been executed
      cy.wait("@GetServiceInventory");

      // Record the current number of instances before attempting to add
      cy.get('[aria-label="InstanceRow-Intro"]').its("length").as("previousCount");

      // Add an instance and fill form
      cy.get("#add-instance-button").click();
      cy.get("#editorButton").click();

      // expect Form and submit buttons to be disabled
      cy.get("#formButton").should("be.disabled");
      cy.get('[aria-label="submit"]').should("be.disabled");

      // Cancel form should still be possible.
      cy.get("button").contains("Cancel").click();

      // make sure the call to get inventory has been executed
      cy.wait("@GetServiceInventory");

      // expect the number of rows to be unchanged after cancelling
      cy.get("@previousCount").then((previousCount) => {
        cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", previousCount);
      });
    });

    it("2.1.6 Instance Details page", () => {
      cy.visit("/console/");

      cy.get('[aria-label="Select-environment-test"]').click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      // Expect to find two badges on the basic-service row.
      cy.get("#basic-service")
        .get('[aria-label="Number of instances by label"]', { timeout: 30000 })
        .children()
        .should("have.length", 2);
      cy.get("#basic-service").contains("Show inventory").click();

      // Check Instance Details page
      cy.get('[aria-label="instance-details-link"]', { timeout: 20000 }).last().click();

      // click on the attributes tab
      cy.get('[aria-label="attributes-content"]').click();

      // assert that first element in table is the name attribute
      cy.get('[data-testid="attribute-key"]').first().should("contain", "name");

      // assert you can sort
      cy.get("button")
        .contains(/^Attribute$/)
        .click();

      // assert the first element is now the address_r1 attribute
      cy.get('[data-testid="attribute-key"]').first().should("contain", "address_r1");

      // this row should contain the active_attribute value 1.2.3.5/32
      cy.get('[aria-label="address_r1_value"]').should("contain", "1.2.3.5/32");

      // assert you can reset the sorting
      cy.get('[aria-label="table-options"]').click();
      cy.get('[aria-label="Reset-sort"]').click();

      // assert that first element in table is the name attribute again
      cy.get('[data-testid="attribute-key"]').first().should("contain", "name");

      // assert you can change attributeSets to Candidate
      cy.get('[aria-label="Select-AttributeSet"]').select("candidate_attributes");

      // assert that the address_r1 attribute value is now the candidate value 1.2.3.8/32
      cy.get('[aria-label="address_r1_value"]').should("contain", "1.2.3.8/32");

      // click on the JSON-editor tab
      cy.get("#JSON").click();
      cy.get(".view-line").eq(1).should("contain", "name");

      // assert you cannot edit the data displayed.
      // This can be verified with the presence of the no-user-select class that Monaco add on readonly content.
      cy.get(".monaco-editor").should("have.class", "no-user-select");

      // click on the compare tab
      cy.get("#Compare").click();

      // assert you can compare two different versions, and that there are differences.
      cy.get(".monaco-diff-editor").should("exist");
      // Check for the presence of diff markers (insert/delete signs)
      cy.get(".codicon-diff-insert, .codicon-diff-remove").should("exist");

      // Update the state to setting_start
      cy.get('[aria-label="Actions-Toggle"]').click();
      cy.get('[role="menuitem"]').last().click();

      // Confirm in the modal
      cy.get("button").contains("Yes").click();

      // expect to find in the history table,
      cy.get('[aria-label="History-Row"]').should(($rows) => {
        expect($rows[0]).to.contain("up");
        expect($rows[1]).to.contain("setting_inprogress");
        expect($rows[2]).to.contain("setting_start");
      });

      // click on the events tab
      cy.get('[aria-label="events-content"]').click();

      // check that there are three rows
      cy.get('[aria-label="Event-table-row"]').should("have.length", 3);

      // open the first row of the events to confirm the data is correct. We can't assert all exact strings because the id's and dates are variable.
      cy.get("#expand-toggle0").click();
      cy.get('[aria-label="Event-details-0"]').should("contain", '"service_instance_version": 8,');

      // close the row again and click on the export link in the second row. Expect to land on the compile report page.
      cy.get('[aria-label="Event-compile-1"]').should("contain", "Export");
      cy.get('[aria-label="Event-compile-1"] > a').click();

      cy.get("h1").contains("Compile Details").should("to.exist");

      // go back to the service inventory
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#basic-service").contains("Show inventory").click();

      // go back to the details page
      cy.get('[aria-label="instance-details-link"]', { timeout: 20000 }).last().click();

      // change version and go to events page. The second version should contain a validation report.
      cy.get('[aria-label="History-Row"]')
        .eq(7)
        .within(() => {
          cy.get('[data-label="version"]').click(); //it's done to avoid flake where the tooltip comes in a way and click ins't triggered
        });
      cy.get('[data-testid="selected-version"]').should("have.text", "Version: 2");

      cy.get('[aria-label="events-content"]').click();

      // check that there are four rows for this version
      cy.get('[aria-label="Event-table-row"]').should("have.length", 4);

      // Check that both Export and Validation events exist in the table
      cy.get('[aria-label="Event-table-row"]').should(($events) => {
        const eventTypes = $events
          .map((_, element) =>
            Cypress.$(element)
              .find('[aria-label^="Event-compile-"] .pf-v6-c-button__text')
              .text()
              .trim()
          )
          .get();

        expect(eventTypes).to.include.members(["Export", "Validation"]);
        expect(eventTypes).to.have.length(4); // Verify total number of events
      });

      // check the source/target states are correct
      cy.get('[aria-label="Event-source-0"]').should("contain", "start");
      cy.get('[aria-label="Event-target-0"]').should("contain", "creating");

      // click on "see all events" and confirm you are redirected on the events page.
      cy.get("a").contains("See all events").click();

      cy.get("h1").contains("Service Instance Events").should("to.exist");
    });

    it("2.1.7 Delete previously created instance", () => {
      cy.visit("/console/");

      // Add interceptions for the delete and get call to be able to catch responses later on.
      cy.intercept("DELETE", "/lsm/v1/service_inventory/basic-service/**").as("DeleteInstance");
      cy.intercept(
        "GET",
        "/lsm/v1/service_inventory/basic-service?include_deployment_progress=True&limit=20&&sort=created_at.desc"
      ).as("GetServiceInventory");

      cy.get('[aria-label="Select-environment-test"]').click();

      // START WORKAROUND

      // TODO: Remove workaround for race condition.
      // Must be done after https://github.com/inmanta/inmanta-lsm/issues/1249
      // Linked to: https://github.com/orgs/inmanta/projects/1?pane=issue&itemId=25836961
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Compile Reports").click();
      cy.get("button", { timeout: 60000 }).contains("Recompile").click();

      // END WORKAROUND.

      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get("#basic-service").contains("Show inventory").click();

      // Check Instance Details page
      cy.get('[aria-label="instance-details-link"]', { timeout: 20000 }).first().click();

      // Check the state of the instance is up in the history section.
      cy.get('[aria-label="History-Row"]', { timeout: 60000 }).should("contain", "up");

      // Go back to inventory using the breadcrumbs
      cy.get('[aria-label="BreadcrumbItem"]').contains("Service Inventory: basic-service").click();

      // delete but cancel deletion in modal
      cy.get('[aria-label="row actions toggle"]', { timeout: 60000 }).last().click();
      cy.get('[role="menuitem"]').contains("Delete").click();
      cy.get(".pf-v6-c-modal-box__header").should("contain", "Delete instance");
      cy.get(".pf-v6-c-form__actions").contains("No").click();

      // delete the instance.
      cy.get('[aria-label="row actions toggle"]', { timeout: 60000 }).last().click();
      cy.get('[role="menuitem"]').contains("Delete").click();
      cy.get(".pf-v6-c-modal-box__header").should("contain", "Delete instance");
      cy.get(".pf-v6-c-form__actions").contains("Yes").click();

      // check response if instance has been deleted successfully.
      cy.wait("@DeleteInstance").its("response.statusCode").should("eq", 200);
    });
  });
}
