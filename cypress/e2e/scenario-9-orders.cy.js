import environmentHelpers from "../support/environmentHelpers";

const { clearEnvironment, forceUpdateEnvironment } = environmentHelpers;

const isIso = Cypress.expose("edition") === "iso";

if (isIso) {
  describe("Scenario 9 : Order Overview", () => {
    before(() => {
      clearEnvironment();
      forceUpdateEnvironment();
    });

    it("Displays a Partial order with multiple dependencies correctly", () => {
      cy.visit("/console/");
      cy.get('[aria-label="Select-environment-test"]').click();

      // go to the Orders page
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Orders").click();

      // it shouldn't have any orders yet
      cy.get('[aria-label="ServiceOrderRow"]').should("not.to.exist");

      // send request for order.
      cy.url().then((url) => {
        const location = new URL(url);
        const id = location.searchParams.get("env");

        cy.request({
          method: "POST",
          url: "/lsm/v2/order",
          headers: { "X-Inmanta-Tid": id },
          body: {
            service_order_items: [
              {
                instance_id: "299d6469-0b3d-4c75-9f46-3a7a083d15e8",
                service_entity: "child-service",
                config: {},
                action: "create",
                attributes: {
                  name: "child1",
                  service_id: "0001",
                  should_deploy_fail: true,
                  parent_entity: "8405a318-c2ea-441f-96f5-d2b7bc2efbd1",
                },
                edits: null,
              },
              {
                instance_id: "8ed0d8f0-6a17-4a3f-a171-9c4ae302b065",
                service_entity: "child-service",
                config: {},
                action: "create",
                attributes: {
                  name: "child2",
                  service_id: "0002",
                  should_deploy_fail: false,
                  parent_entity: "8405a318-c2ea-441f-96f5-d2b7bc2efbd1",
                },
                edits: null,
              },
              {
                instance_id: "8405a318-c2ea-441f-96f5-d2b7bc2efbd1",
                service_entity: "parent-service",
                config: {},
                action: "create",
                attributes: {
                  name: "parent",
                  service_id: "0003",
                  should_deploy_fail: false,
                },
                edits: null,
              },
            ],
            description: "Ordered by Composer",
          },
        });
      });

      // it should have one row displayed.
      cy.get('[aria-label="ServiceOrderRow"]').should("have.length", 1);

      // the status should be in progress
      cy.get('[aria-label="ServiceOrderRow"]').should("contain", "in progress");

      // wait until status is partial
      cy.get('[aria-label="ServiceOrderRow"]', { timeout: 60000 }).should("contain", "partial");

      // description should be "Ordered by Composer"
      cy.get('[aria-label="ServiceOrderRow"]').should("contain", "Ordered by Composer");

      // it should have a deployment progress bar with one failed item, and two completed
      cy.get('[aria-label="LegendItem-failed"]').should("contain", 1);
      cy.get('[aria-label="LegendItem-completed"]').should("contain", 2);

      // click on the show details
      cy.get("button").contains("Show Details").click();

      // should be redirected to the Order details page
      cy.get("h1").contains("Order Details").should("to.exist");

      // it should have the same state : partial
      cy.get('[aria-label="OrderState"]').should("contain", "partial");

      // the progress bar should display the same, one failed, two completed
      cy.get('[aria-label="LegendItem-failed"]').should("contain", 1);
      cy.get('[aria-label="LegendItem-completed"]').should("contain", 2);

      // the table should have three rows
      cy.get('[aria-label="ServiceOrderDetailsRow"]').should("have.length", 3);

      // two rows should be completed, one should be failed
      cy.get('[aria-label="ServiceOrderDetailsRow"]').eq(0).should("include.text", "failed");
      cy.get('[aria-label="ServiceOrderDetailsRow"]').eq(1).should("include.text", "completed");
      cy.get('[aria-label="ServiceOrderDetailsRow"]').eq(2).should("include.text", "completed");

      // expand the failed row
      cy.get('[aria-label="ServiceOrderDetailsRow"]')
        .eq(0)
        .find('[aria-label="Toggle-DetailsRow"]')
        .click();

      // should have a detail section with Failure Type, Reason, and show compile button
      cy.get('[aria-label="Expanded-Discovered-Row"]')
        .eq(0)
        .find('[aria-label="Expanded-Details"]')
        .should("contain", "EXECUTION_FAILED");
      cy.get('[aria-label="Expanded-Discovered-Row"]')
        .eq(0)
        .find('[aria-label="Expanded-Details"]')
        .should("contain", "An error occurred during deployment");
      cy.get('[aria-label="Expanded-Discovered-Row"]')
        .eq(0)
        .find('[aria-label="Expanded-Details"]')
        .should("contain", "Show Compile Report");

      // it should have one dependency which is completed
      cy.get('[aria-label="Expanded-Discovered-Row"]')
        .eq(0)
        .find('[aria-label="Dependency-Row-0"]')
        .should("contain", "completed");

      // the config should be empty
      cy.get('[aria-label="Expanded-Discovered-Row"]')
        .eq(0)
        .find('[aria-label="Expanded-Config"]')
        .should("contain", "Empty");

      // the body should contain information about the created instance
      cy.get('[aria-label="Expanded-Discovered-Row"]')
        .eq(0)
        .find('[aria-label="Expanded-Body"]')
        .should("contain", "child1");
      cy.get('[aria-label="Expanded-Discovered-Row"]')
        .eq(0)
        .find('[aria-label="Expanded-Body"]')
        .should("contain", "0001");
      cy.get('[aria-label="Expanded-Discovered-Row"]')
        .eq(0)
        .find('[aria-label="Expanded-Body"]')
        .should("contain", "parent_entity");

      // expand second row
      cy.get('[aria-label="ServiceOrderDetailsRow"]')
        .eq(1)
        .find('[aria-label="Toggle-DetailsRow"]')
        .click();

      // in the detail section, this row should only contain the compile report button
      cy.get('[aria-label="Expanded-Discovered-Row"]')
        .eq(1)
        .find('[aria-label="Expanded-Details"]')
        .should("contain", "Show Compile Report");
      cy.get('[aria-label="Expanded-Discovered-Row"]')
        .eq(1)
        .find('[aria-label="Expanded-Details"]')
        .should("not.contain", "Reason");
      cy.get('[aria-label="Expanded-Discovered-Row"]')
        .eq(1)
        .find('[aria-label="Expanded-Details"]')
        .should("not.contain", "Failure Type");

      // it shouldn't have any dependencies either.
      cy.get('[aria-label="Expanded-Discovered-Row"]')
        .eq(1)
        .find('[aria-label="Expanded-Dependencies"]')
        .should("contain", "Empty");

      // the config should also be empty
      cy.get('[aria-label="Expanded-Discovered-Row"]')
        .eq(1)
        .find('[aria-label="Expanded-Config"]')
        .should("contain", "Empty");

      // the body should contain information about the created instance
      cy.get('[aria-label="Expanded-Discovered-Row"]')
        .eq(1)
        .find('[aria-label="Expanded-Body"]')
        .should("contain", "parent");
      cy.get('[aria-label="Expanded-Discovered-Row"]')
        .eq(1)
        .find('[aria-label="Expanded-Body"]')
        .should("contain", "0003");
      cy.get('[aria-label="Expanded-Discovered-Row"]')
        .eq(1)
        .find('[aria-label="Expanded-Body"]')
        .should("contain", "service_id");
    });
  });
}
