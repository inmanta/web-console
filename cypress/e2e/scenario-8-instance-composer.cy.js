/**
 * Shorthand method to clear the environment being passed.
 * By default, if no arguments are passed it will target the 'lsm-frontend' environment.
 *
 * @param {string} nameEnvironment
 */
const clearEnvironment = (nameEnvironment = "lsm-frontend") => {
  cy.visit("/console/");
  cy.get('[aria-label="Environment card"]').contains(nameEnvironment).click();
  cy.url().then((url) => {
    const location = new URL(url);
    const id = location.searchParams.get("env");
    cy.request("DELETE", `/api/v1/decommission/${id}`);
  });
};

/**
 * based on the environment id, it will recursively check if a compile is pending.
 * It will continue the recursion as long as the statusCode is equal to 200
 *
 * @param {string} id
 */
const checkStatusCompile = (id) => {
  let statusCodeCompile = 200;

  if (statusCodeCompile === 200) {
    cy.intercept(`/api/v1/notify/${id}`).as("IsCompiling");
    // the timeout is necessary to avoid errors.
    // Cypress doesn't support while loops and this was the only workaround to wait till the statuscode is not 200 anymore.
    // the default timeout in cypress is 5000, but since we have recursion it goes into timeout for the nested awaits because of the recursion.
    cy.wait("@IsCompiling", { timeout: 15000 }).then((req) => {
      statusCodeCompile = req.response.statusCode;

      if (statusCodeCompile === 200) {
        checkStatusCompile(id);
      }
    });
  }
};

/**
 * Will by default execute the force update on the 'lsm-frontend' environment if no argumenst are being passed.
 * This method can be executed standalone, but is part of the cleanup cycle that is needed before running a scenario.
 *
 * @param {string} nameEnvironment
 */
const forceUpdateEnvironment = (nameEnvironment = "lsm-frontend") => {
  cy.visit("/console/");
  cy.get('[aria-label="Environment card"]').contains(nameEnvironment).click();
  cy.url().then((url) => {
    const location = new URL(url);
    const id = location.searchParams.get("env");
    cy.request({
      method: "POST",
      url: `/lsm/v1/exporter/export_service_definition`,
      headers: { "X-Inmanta-Tid": id },
      body: { force_update: true },
    });
    checkStatusCompile(id);
  });
};

if (Cypress.env("edition") === "iso") {
  describe("Scenario 8 - Instance Composer", () => {
    before(() => {
      clearEnvironment();
      forceUpdateEnvironment();
    });

    it("8.1 create instance with embedded entities", () => {
      // Select 'test' environment
      cy.visit("/console/");
      cy.get('[aria-label="Environment card"]')
        .contains("lsm-frontend")
        .click();
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();

      // click on Show Inventory on embedded-entity-service-extra, expect one instance already
      cy.get("#embedded-entity-service-extra", { timeout: 60000 })
        .contains("Show inventory")
        .click();
      cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");

      // click on add instance
      cy.get("#add-instance-composer-button").click();

      // Create instance on embedded-entity-service-extra
      cy.get(".canvas").should("be.visible");

      // Open and fill instance form of core attributes
      cy.get('[aria-label="new-entity-button"]').click();
      cy.get('[aria-label="service-picker"]').click();
      cy.get(".pf-v5-c-menu__item-text")
        .contains("embedded-entity-service-extra")
        .click();

      cy.get("#service_id").type("0002");
      cy.get("#name").type("embedded-service");
      cy.get("button").contains("Confirm").click();

      //try to deploy instance with only core attributes and expect 2 errors
      cy.get("button").contains("Deploy").click();
      cy.get('[data-testid="ToastAlert"]')
        .contains(
          "Invalid request: 2 validation errors for embedded-entity-service-extra",
        )
        .should("be.visible");
      cy.get(".pf-v5-c-alert__action > .pf-v5-c-button").click();

      // add ro_meta core entity
      cy.get('[aria-label="new-entity-button"]').click();
      cy.get('[aria-label="service-picker"]').click();
      cy.get(".pf-v5-c-menu__item-text")
        .contains("ro_meta (embedded-entity-service-extra)")
        .click();

      cy.get("#name").type("ro_meta");
      cy.get("#meta_data").type("meta_data1");
      cy.get("#other_data").type("1");
      cy.get("button").contains("Confirm").click();

      cy.get('[joint-selector="headerLabel"]').contains("ro_meta").click();
      cy.get('[data-action="link"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 700,
          clientY: 300,
        })
        .trigger("mouseup");

      //try to deploy instance with only one required embedded attribute connected and expect 1 error
      cy.get("button").contains("Deploy").click();
      cy.get('[data-testid="ToastAlert"]')
        .contains(
          "Invalid request: 1 validation error for embedded-entity-service-extra",
        )
        .should("be.visible");
      cy.get(".pf-v5-c-alert__action > .pf-v5-c-button").click();

      cy.get('[aria-label="new-entity-button"]').click();
      cy.get('[aria-label="service-picker"]').click();
      cy.get(".pf-v5-c-menu__item-text")
        .contains("rw_meta (embedded-entity-service-extra)")
        .click();
      cy.get("#name").type("rw_meta");
      cy.get("#meta_data").type("meta_data2");
      cy.get("#other_data").type("2");
      cy.get("button").contains("Confirm").click();

      cy.get('[joint-selector="headerLabel"]').contains("rw_meta").click();
      cy.get('[data-action="link"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 700,
          clientY: 400,
        })
        .trigger("mouseup");

      cy.get('[aria-label="new-entity-button"]').click();
      cy.get('[aria-label="service-picker"]').click();

      cy.get(".pf-v5-c-menu__item-text")
        .contains("rw_files (embedded-entity-service-extra)")
        .click();
      cy.get("#name").type("rw_files1");
      cy.get("#data").type("data1");
      cy.get("button").contains("Confirm").click();

      cy.get('[joint-selector="headerLabel"]').contains("rw_files").click();
      cy.get('[data-action="link"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 700,
          clientY: 350,
        })
        .trigger("mouseup");

      cy.get("button").contains("Deploy").click();

      // Check if only one row has been added to the table.
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);
      // await until all instances are being deployed and up
      cy.get('[data-label="State"]', { timeout: 90000 }).should(
        "have.text",
        "up",
      );
    });

    it("8.2 edit instance with embedded entities", () => {
      // Select 'test' environment
      cy.visit("/console/");
      cy.get('[aria-label="Environment card"]')
        .contains("lsm-frontend")
        .click();
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();

      // click on Show Inventory on embedded-entity-service-extra, expect one instance already
      cy.get("#embedded-entity-service-extra", { timeout: 60000 })
        .contains("Show inventory")
        .click();
      cy.get('[aria-label="ServiceInventory-Success"]').should("to.be.visible");

      // click on kebab menu on embedded-entity-service-extra
      cy.get('[aria-label="row actions toggle"]').eq(0).click();
      cy.get("button").contains("Edit in Composer").click();

      // Expect to be redirected to Instance Composer view with embedded-entity-service-extra shape visible
      cy.get(".canvas").should("be.visible");
      cy.get('[data-type="app.ServiceEntityBlock"]').should("be.visible");
      cy.get('[joint-selector="headerLabel"]')
        .contains("embedded-entity-")
        .should("exist");
      cy.get('[joint-selector="headerLabel"]')
        .contains("ro_meta")
        .should("exist");
      cy.get('[joint-selector="headerLabel"]')
        .contains("rw_meta")
        .should("exist");
      cy.get('[joint-selector="headerLabel"]')
        .contains("rw_files")
        .should("exist");

      cy.get('[aria-label="new-entity-button"]').click();
      cy.get('[aria-label="service-picker"]').click();
      cy.get(".pf-v5-c-menu__item-text")
        .contains("rw_files (embedded-entity-service-extra)")
        .click();
      cy.get("#name").type("rw_files2");
      cy.get("#data").type("data2");
      cy.get("button").contains("Confirm").click();

      cy.get('[joint-selector="itemLabel_name_value"]')
        .contains("rw_files2") //easiest way to differentiate same type of entities is by the unique attributes values
        .click();
      cy.get('[data-action="link"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 750,
          clientY: 270,
        })
        .trigger("mouseup");
      cy.get('[data-type="Link"]').should("have.length", "3");
      cy.get('[data-action="delete"]').click();

      cy.get('[aria-label="new-entity-button"]').click();
      cy.get('[aria-label="service-picker"]').click();
      cy.get(".pf-v5-c-menu__item-text")
        .contains("ro_files (embedded-entity-service-extra)")
        .click();
      cy.get("#name").type("ro_files2");
      cy.get("#data").type("data2");
      cy.get("button").contains("Confirm").click();

      cy.get(".zoom-out").click();

      cy.get('[joint-selector="headerLabel"]').contains("ro_files").click();
      cy.get('[data-action="link"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 450,
          clientY: 250,
        })
        .trigger("mouseup");

      cy.get("button").contains("Deploy").click();

      // Check if only one row has been added to the table.
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);
      // await until all instances are being deployed and up
      cy.get('[data-label="State"]', { timeout: 90000 }).should(
        "have.text",
        "up",
      );
      cy.get("#expand-toggle0").click();
      cy.get("button").contains("Attributes").click();
      cy.get('[aria-label="Toggle-ro_files"]').click();
      cy.get('[aria-label="Toggle-ro_files$0"]').click();
      cy.get(
        '[aria-label="Row-ro_files$0$data"] > [data-label="candidate"]',
      ).should("have.text", "data2");
      cy.get(
        '[aria-label="Row-ro_files$0$name"] > [data-label="candidate"]',
      ).should("have.text", "ro_files2");
      //go back to composer to further edit component
      cy.get('[aria-label="row actions toggle"]').eq(0).click();
      cy.get("button").contains("Edit in Composer").click();

      //try to delete optional rw embedded entity
      cy.get(".zoom-out").click();
      cy.get('[joint-selector="headerLabel"]').contains("rw_files").click();
      cy.get('[data-action="delete"]').click();

      cy.get("button").contains("Deploy").click();
      cy.get('[data-testid="ToastAlert"]')
        .contains(
          "Attribute rw_files cannot be updated because it has the attribute modifier rw",
        )
        .should("be.visible");
      cy.reload();

      //try to delete required embedded entity
      cy.get('[joint-selector="headerLabel"]').contains("ro_meta").click();
      cy.get('[data-action="delete"]').click();
      cy.get("button").contains("Deploy").click();
      cy.get('[data-testid="ToastAlert"]')
        .contains("invalid: 1 validation error for dict")
        .should("be.visible");
      cy.reload();

      cy.get('[joint-selector="headerLabel"]').contains("ro_files").click();
      cy.get('[data-action="delete"]').click();

      cy.get('[joint-selector="headerLabel"]').contains("ro_meta").click();
      cy.get('[data-action="edit"]').click();
      cy.get("#meta_data").type("{backspace}-new");
      cy.get("#name").should("not.exist");
      cy.get("button").contains("Confirm").click();

      cy.get("button").contains("Deploy").click();

      // Check if only one row has been added to the table.
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);
      // await until all instances are being deployed and up
      cy.get('[data-label="State"]', { timeout: 90000 }).should(
        "have.text",
        "up",
      );

      cy.get("button").contains("Attributes").click();
      cy.get('[aria-label="Row-ro_files"] > [data-label="candidate"]').should(
        "have.text",
        "{}",
      );
      cy.get(
        '[aria-label="Row-ro_meta$meta_data"] > [data-label="candidate"]',
      ).should("have.text", "meta_data-new");
    });

    it("8.3 create instances with inter-service relation", () => {
      // Select 'test' environment
      cy.visit("/console/");
      cy.get('[aria-label="Environment card"]')
        .contains("lsm-frontend")
        .click();
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();

      // click on Show Inventory on parent-service, expect one instance already
      cy.get("#parent-service", { timeout: 60000 })
        .contains("Show inventory")
        .click();
      cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");

      // click on add instance in composer
      cy.get("#add-instance-composer-button").click();
      cy.get(".canvas").should("be.visible");

      // Open and fill instance form of parent-service
      cy.get('[aria-label="new-entity-button"]').click();
      cy.get('[aria-label="service-picker"]').click();
      cy.get(".pf-v5-c-menu__item-text").contains("parent-service").click();

      cy.get("#service_id").type("0003");
      cy.get("#name").type("parent-service");
      cy.get("button").contains("Confirm").click();

      // Open and fill instance form of child-service and connect it with parent-service
      cy.get('[aria-label="new-entity-button"]').click();
      cy.get('[aria-label="service-picker"]').click();
      cy.get(".pf-v5-c-menu__item-text").contains("child-service").click();

      cy.get("#service_id").type("0004");
      cy.get("#name").type("child-service");
      cy.get("button").contains("Confirm").click();

      //check if errors is returned when we deployed service without inter-service relation set
      cy.get("button").contains("Deploy").click();
      cy.get('[data-testid="ToastAlert"]')
        .contains(`Invalid request: 1 validation error for child-service`)
        .should("be.visible");
      cy.get(".pf-v5-c-alert__action > .pf-v5-c-button").click();

      //connect services
      cy.get('[joint-selector="headerLabel"]')
        .contains("child-service")
        .click();
      cy.get('[data-action="link"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 700,
          clientY: 300,
        })
        .trigger("mouseup");

      cy.get("button").contains("Deploy").click();

      // Check if only one row has been added to the table.
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);
      // await until all instances are being deployed and up
      cy.get('[data-label="State"]', { timeout: 90000 }).should(
        "have.text",
        "up",
      );

      //Check child-service
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();
      cy.get("#child-service", { timeout: 60000 })
        .contains("Show inventory")
        .click();
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);
      cy.get('[data-label="State"]', { timeout: 90000 }).should(
        "have.text",
        "up",
      );

      //go back to parent-service inventory view
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();
      // click on Show Inventory on parent-service, expect one instance already
      cy.get("#parent-service", { timeout: 60000 })
        .contains("Show inventory")
        .click();
      // click on add instance in composer
      cy.get("#add-instance-composer-button").click();
      cy.get(".canvas").should("be.visible");

      // Open and fill instance form of parent-service
      cy.get('[aria-label="new-entity-button"]').click();
      cy.get('[aria-label="service-picker"]').click();
      cy.get(".pf-v5-c-menu__item-text").contains("parent-service").click();

      cy.get("#service_id").type("0006");
      cy.get("#name").type("parent-service2");
      cy.get("button").contains("Confirm").click();

      // Open and fill instance forms for container-service then connect it with parent-service
      cy.get('[aria-label="new-entity-button"]').click();
      cy.get('[aria-label="service-picker"]').click();
      cy.get(".pf-v5-c-menu__item-text").contains("container-service").click();

      cy.get("#service_id").type("0007");
      cy.get("#name").type("container-service");
      cy.get("button").contains("Confirm").click();

      cy.get('[aria-label="new-entity-button"]').click();
      cy.get('[aria-label="service-picker"]').click();
      cy.get(".pf-v5-c-menu__item-text")
        .contains("child_container (container-service)")
        .click();
      cy.get("#name").type("child_container");
      cy.get("button").contains("Confirm").click();

      cy.get('[joint-selector="headerLabel"]')
        .contains("child_container")
        .click();
      cy.get('[data-action="link"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 700,
          clientY: 300,
        })
        .trigger("mouseup");
      cy.get('[joint-selector="headerLabel"]')
        .contains("child_container")
        .click();
      cy.get('[data-action="link"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 400,
          clientY: 300,
        })
        .trigger("mouseup");
      cy.get("button").contains("Deploy").click();

      // Check if only one row has been added to the table.
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 2);
      // await until all instances are being deployed and up
      cy.get('[data-label="State"]', { timeout: 90000 })
        .eq(0, { timeout: 90000 })
        .should("have.text", "up");

      //Check container-service
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();
      cy.get("#container-service", { timeout: 60000 })
        .contains("Show inventory")
        .click();
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);
      cy.get('[data-label="State"]', { timeout: 90000 }).should(
        "have.text",
        "up",
      );

      //go back to parent-service inventory view
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();
      // click on Show Inventory on parent-service, expect one instance already
      cy.get("#parent-service", { timeout: 60000 })
        .contains("Show inventory")
        .click();
      // click on add instance in composer
      cy.get("#add-instance-composer-button").click();
      cy.get(".canvas").should("be.visible");

      // Open and fill instance form of parent-service
      cy.get('[aria-label="new-entity-button"]').click();
      cy.get('[aria-label="service-picker"]').click();
      cy.get(".pf-v5-c-menu__item-text").contains("parent-service").click();

      cy.get("#service_id").type("0008");
      cy.get("#name").type("parent-service3");
      cy.get("button").contains("Confirm").click();
      // Open and fill instance form of child-with-many-parents-service then connect it with parent-service
      cy.get('[aria-label="new-entity-button"]').click();
      cy.get('[aria-label="service-picker"]').click();
      cy.get(".pf-v5-c-menu__item-text")
        .contains("child-with-many-parents-service")
        .click();
      cy.get("#service_id").type("0009");
      cy.get("#name").type("child-with-many-parents");
      cy.get("button").contains("Confirm").click();

      cy.get('[joint-selector="headerLabel"]').contains("child-with").click();
      cy.get('[data-action="link"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 700,
          clientY: 300,
        })
        .trigger("mouseup");

      cy.get("button").contains("Deploy").click();
      // Check if only one row has been added to the table.
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 3);
      // await until all instances are being deployed and up
      cy.get('[data-label="State"]', { timeout: 90000 })
        .eq(0, { timeout: 90000 })
        .should("have.text", "up");
      //Check child-with-many-parents-service
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();
      cy.get("#child-with-many-parents-service", { timeout: 60000 })
        .contains("Show inventory")
        .click();
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);
      cy.get('[data-label="State"]', { timeout: 90000 }).should(
        "have.text",
        "up",
      );
    });

    it("8.4 edit instances inter-service relation", () => {
      // Select 'test' environment
      cy.visit("/console/");
      cy.get('[aria-label="Environment card"]')
        .contains("lsm-frontend")
        .click();
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();

      // click on Show Inventory on parent-service, expect three instances already
      cy.get("#parent-service", { timeout: 60000 })
        .contains("Show inventory")
        .click();
      cy.get('[aria-label="ServiceInventory-Success"]').should("to.be.visible");

      // click on kebab menu on first created parent-service
      cy.get(".pf-v5-c-drawer__content").scrollTo("bottom");
      cy.get('[aria-label="row actions toggle"]').eq(2).click();
      cy.get("button").contains("Edit in Composer").click();

      //Open and fill instance form of parent-service
      cy.get('[aria-label="new-entity-button"]').click();
      cy.get('[aria-label="service-picker"]').click();
      cy.get(".pf-v5-c-menu__item-text").contains("parent-service").click();

      cy.get("#service_id").type("00010");
      cy.get("#name").type("new-parent-service");
      cy.get("button").contains("Confirm").click();
      cy.get('[data-type="Link"]').trigger("mouseover", { force: true });
      cy.get(".joint-link_remove-circle").click();
      cy.get(".joint-link_remove-circle").click();

      //connect services
      cy.get('[joint-selector="headerLabel"]')
        .contains("child-service")
        .click();
      cy.get('[data-action="link"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 900,
          clientY: 300,
        })
        .trigger("mouseup");
      cy.get("button").contains("Deploy").click();

      // Check if only one row has been added to the table.
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 4);
      cy.get('[data-label="State"]', { timeout: 90000 })
        .eq(0, { timeout: 90000 })
        .should("have.text", "up");

      // check if attribute was edited correctly
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();
      cy.get("#child-service", { timeout: 60000 })
        .contains("Show inventory")
        .click();
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);
      cy.get('[data-label="State"]', { timeout: 90000 }).should(
        "have.text",
        "up",
      );
      cy.get("#expand-toggle0").click();
      cy.get("button").contains("Attributes").click();
      cy.get(
        '[aria-label="Row-parent_entity"] > [data-label="active"] > .pf-v5-l-flex > div > .pf-v5-c-button',
      ).should("have.text", "new-parent-service");

      //go back to parent-service inventory view
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();
      cy.get("#parent-service", { timeout: 60000 })
        .contains("Show inventory")
        .click();
      cy.get(".pf-v5-c-drawer__content").scrollTo("bottom");
      cy.get('[aria-label="row actions toggle"]').eq(2).click();
      cy.get("button").contains("Edit in Composer").click();

      //remove connection
      cy.get('[data-type="Link"]').eq(0).trigger("mouseover", { force: true });
      cy.get(".joint-link_remove-circle").click();
      cy.get(".joint-link_remove-circle").click();

      //Open and fill instance form of parent-service
      cy.get('[aria-label="new-entity-button"]').click();
      cy.get('[aria-label="service-picker"]').click();
      cy.get(".pf-v5-c-menu__item-text").contains("parent-service").click();
      cy.get("#service_id").type("00011");
      cy.get("#name").type("new-parent-service2");
      cy.get("button").contains("Confirm").click();

      //move child_container closer to new parent-service and connect them
      cy.get('[joint-selector="headerLabel"]')
        .contains("child_container")
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 700,
          clientY: -100,
        })
        .trigger("mouseup");
      cy.get('[data-action="link"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 1100,
          clientY: 500,
        })
        .trigger("mouseup");
      cy.get("button").contains("Deploy").click();

      // Check if only one row has been added to the table.
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 5);
      // await until all instances are being deployed and up
      cy.get('[data-label="State"]', { timeout: 90000 })
        .eq(0, { timeout: 90000 })
        .should("have.text", "up");
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();

      // check if attribute was edited correctly
      cy.get("#container-service", { timeout: 60000 })
        .contains("Show inventory")
        .click();
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);
      cy.get('[data-label="State"]', { timeout: 90000 }).should(
        "have.text",
        "up",
      );
      cy.get("#expand-toggle0").click();
      cy.get("button").contains("Attributes").click();
      cy.get('[aria-label="Toggle-child_container"]').click();
      cy.get(
        '[aria-label="Row-child_container$parent_entity"] > [data-label="active"] > .pf-v5-l-flex > div > .pf-v5-c-button',
      ).should("have.text", "new-parent-service2");
      //go back to parent-service inventory view
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();
      // click on Show Inventory on parent-service, expect one instance already
      cy.get("#parent-service", { timeout: 60000 })
        .contains("Show inventory")
        .click();
      cy.get(".pf-v5-c-drawer__content").scrollTo("bottom");
      cy.get('[aria-label="row actions toggle"]').eq(2).click();
      cy.get("button").contains("Edit in Composer").click();

      //Open and fill instance form of parent-service
      cy.get('[aria-label="new-entity-button"]').click();
      cy.get('[aria-label="service-picker"]').click();
      cy.get(".pf-v5-c-menu__item-text").contains("parent-service").click();
      cy.get("#service_id").type("00012");
      cy.get("#name").type("new-parent-service3");
      cy.get("button").contains("Confirm").click();

      // connect child-with-many-parents to new parent-service
      cy.get('[joint-selector="headerLabel"]').contains("child-with").click();
      cy.get('[data-action="link"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 900,
          clientY: 300,
        })
        .trigger("mouseup");
      cy.get("button").contains("Deploy").click();

      // Check if only one row has been added to the table.
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 6);
      // await until all instances are being deployed and up
      cy.get('[data-label="State"]', { timeout: 90000 })
        .eq(0, { timeout: 90000 })
        .should("have.text", "up");
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();

      // check if attribute was edited correctly
      cy.get("#child-with-many-parents-service", { timeout: 60000 })
        .contains("Show inventory")
        .click();
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);
      cy.get('[data-label="State"]', { timeout: 90000 }).should(
        "have.text",
        "up",
      );
      cy.get("#expand-toggle0").click();
      cy.get("button").contains("Attributes").click();
      cy.get(
        '[aria-label="Row-parent_entity"] > [data-label="active"] > .pf-v5-l-flex > div > .pf-v5-c-button',
      )
        .eq(0)
        .should("have.text", "parent-service3");
      cy.get(
        '[aria-label="Row-parent_entity"] > [data-label="active"] > .pf-v5-l-flex > div > .pf-v5-c-button',
      )
        .eq(1)
        .should("have.text", "new-parent-service3");
    });

    it("8.5 delete instance", () => {
      // Select 'test' environment
      cy.visit("/console/");
      cy.get('[aria-label="Environment card"]')
        .contains("lsm-frontend")
        .click();
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();

      // click on Show Inventory on embedded-entity-service-extra, expect one instance already
      cy.get("#parent-service", { timeout: 60000 })
        .contains("Show inventory")
        .click();
      cy.get('[aria-label="ServiceInventory-Success"]').should("to.be.visible");
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 6);

      // click on kebab menu on embedded-entity-service-extra
      cy.get('[aria-label="row actions toggle"]').eq(5).click();
      cy.get("button").contains("Edit in Composer").click();
      cy.get('[joint-selector="headerLabel"]')
        .contains("parent-service")
        .click();
      cy.get('[data-action="delete"]').click();
      cy.get("button").contains("Deploy").click();

      // Check if only one row has been deleted to the table.
      cy.get('[aria-label="InstanceRow-Intro"]', { timeout: 90000 }).should(
        "have.length",
        5,
      );
    });
  });
}
