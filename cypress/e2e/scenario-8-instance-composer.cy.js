/**
 * Shorthand method to clear the environment being passed.
 * By default, if no arguments are passed it will target the 'lsm-frontend' environment.
 *
 * @param {string} nameEnvironment
 */
const clearEnvironment = (nameEnvironment = "test") => {
  cy.visit("/console/");
  cy.get(`[aria-label="Select-environment-${nameEnvironment}"]`).click();
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
const forceUpdateEnvironment = (nameEnvironment = "test") => {
  cy.visit("/console/");
  cy.get(`[aria-label="Select-environment-${nameEnvironment}"]`).click();
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
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  describe("Scenario 8 - Instance Composer", async () => {
    before(() => {
      clearEnvironment();
      forceUpdateEnvironment();
    });

    // Note: The fullscreen mode is tested in Jest. In Cypress this functionality has to be stubbed, and would be redundant with the Unit tests.
    it("8.1 composer opens up has its default panning working", () => {
      // Select 'test' environment
      cy.visit("/console/");
      cy.get(`[aria-label="Select-environment-test"]`).click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]')
        .contains("Service Catalog")
        .click();

      // click on Show Inventory on embedded-entity-service-extra, expect no instances
      cy.get("#container-service", { timeout: 60000 })
        .contains("Show inventory")
        .click();
      cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");
      // click on add instance with composer
      cy.get('[aria-label="AddInstanceToggle"]').click();
      cy.get("#add-instance-composer-button").click();

      // Expect Canvas to be visible and default instances to be present
      cy.get(".canvas").should("be.visible");
      cy.get('[data-type="app.ServiceEntityBlock"').should("have.length", 2);

      //expect Zoom Handler and all its component visible and in default state
      cy.get('[data-testid="zoomHandler"').should("be.visible");
      cy.get('[data-testid="fullscreen"').should("be.visible");
      cy.get('[data-testid="fit-to-screen"').should("be.visible");

      cy.get('[data-testid="slider-input"').should("be.visible");
      cy.get('[data-testid="slider-input"').should("have.value", "120");

      cy.get('[data-testid="slider-output"').should("be.visible");
      cy.get('[data-testid="slider-output"').should("have.text", "120");

      cy.get(".units").should("be.visible");
      cy.get(".units").contains("%"); //should('have.text', '%'); won't work because of the special character

      //assertion that fit-to-screen button works can be only done by checking output and the input value, as I couldn't extract the transform property from the `.joint-layers` element
      cy.get('[data-testid="fit-to-screen"').click();

      cy.get('[data-testid="slider-input"').should("have.value", "220");
      cy.get('[data-testid="slider-output"').should("have.text", "220");

      //assert that zoom button works
      cy.get('[data-testid="slider-input"')
        .invoke("val", 300)
        .trigger("change");
      cy.get('[data-testid="slider-input"').should("have.value", "300");
      cy.get('[data-testid="slider-output"').should("have.text", "300");

      cy.get('[data-testid="slider-input"').invoke("val", 80).trigger("change");
      cy.get('[data-testid="slider-input"').should("have.value", "80");
      cy.get('[data-testid="slider-output"').should("have.text", "80");

      //expect Left Sidebar and it's all component visible and in default state
      cy.get(".left_sidebar").should("be.visible");
      cy.get("#tabs-toolbar").should("be.visible");

      cy.get("#instance-stencil").should("be.visible");
      cy.get("#inventory-stencil").should("not.be.visible");

      //expect Left sidebar to have ability to switch between tabs
      cy.get("#inventory-tab").click();

      cy.get("#instance-stencil").should("not.be.visible");
      cy.get("#inventory-stencil").should("be.visible");

      cy.get("#new-tab").click();

      cy.get("#instance-stencil").should("be.visible");
      cy.get("#inventory-stencil").should("not.be.visible");
    });

    it("8.2 composer create view can perform it's required functions and deploy created instance", () => {
      // Select 'test' environment
      cy.visit("/console/");
      cy.get(`[aria-label="Select-environment-test"]`).click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]')
        .contains("Service Catalog")
        .click();

      //Add parent instance
      // click on Show Inventory of parent-service, expect no instances
      cy.get("#parent-service", { timeout: 60000 })
        .contains("Show inventory")
        .click();

      cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");
      // click on add instance with composer
      cy.get('[aria-label="AddInstanceToggle"]').click();
      cy.get("#add-instance-composer-button").click();

      // Expect Canvas to be visible
      cy.get(".canvas").should("be.visible");

      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("parent-service")
        .click();

      //assert that core instance can't be removed, and cancel button is by default disabled
      cy.get('[data-testid="Composer-Container"]').within(() => {
        cy.get("button")
          .contains("span", "Cancel")
          .parent()
          .should("be.disabled");
        cy.get("button")
          .contains("span", "Remove")
          .parent()
          .should("be.disabled");
      });

      //fill parent attributes
      cy.get('[aria-label="TextInput-name"]').type("test_name");
      cy.get('[aria-label="TextInput-service_id"]').type("test_id");

      //clear all inputs and assert that cancel button is enabled
      cy.get('[data-testid="Composer-Container"]').within(() => {
        cy.get("button")
          .contains("span", "Cancel")
          .parent()
          .should("be.enabled");
        cy.get("button").contains("Cancel").click();
      });

      //assert that inputs are cleared and cancel button is set back to disabled
      cy.get('[aria-label="TextInput-name"]').should("have.value", "");
      cy.get('[aria-label="TextInput-service_id"]').should("have.value", "");
      cy.get('[data-testid="Composer-Container"]').within(() => {
        cy.get("button")
          .contains("span", "Cancel")
          .parent()
          .should("be.disabled");
      });

      //fill parent attributes
      cy.get('[aria-label="TextInput-name"]').type("test_name");
      cy.get('[aria-label="TextInput-service_id"]').type("test_id");
      cy.get('[joint-selector="itemLabel_name"]')
        .contains("name")
        .should("be.visible");

      cy.get('[joint-selector="itemLabel_name"]')
        .contains("name")
        .should("be.visible");
      cy.get('[joint-selector="itemLabel_name_value"]')
        .contains("test_name")
        .should("be.visible");

      cy.get("button").contains("Deploy").click();

      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);

      //add another parent instance
      cy.get('[aria-label="AddInstanceToggle"]').click();
      cy.get("#add-instance-composer-button").click();
      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("parent-service")
        .click();

      //fill parent attributes
      cy.get('[aria-label="TextInput-name"]').type("test_name2");
      cy.get('[aria-label="TextInput-service_id"]').type("test_id2");

      cy.get("button").contains("Deploy").click();

      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 2);
      // await until two parent_service are deployed and up
      cy.get('[data-label="State"]', { timeout: 90000 })
        .eq(1, { timeout: 90000 })
        .should("have.text", "up", { timeout: 90000 });
      cy.get('[data-label="State"]', { timeout: 90000 })
        .eq(0, { timeout: 90000 })
        .should("have.text", "up", { timeout: 90000 });

      //Add child_service instance
      cy.get('[aria-label="Sidebar-Navigation-Item"]')
        .contains("Service Catalog")
        .click();
      // click on Show Inventory of many-defaults service, expect no instances
      cy.get("#many-defaults", { timeout: 60000 })
        .contains("Show inventory")
        .click();
      cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");
      // click on add instance with composer
      cy.get('[aria-label="AddInstanceToggle"]').click();
      cy.get("#add-instance-composer-button").click();

      // Expect Canvas to be visible
      cy.get(".canvas").should("be.visible");

      //assert if default entities are present, on init on the canvas we should have already basic required structure for the service instance
      cy.get('[data-type="app.ServiceEntityBlock"').should("have.length", 2);
      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("embedded")
        .should("be.visible");
      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("many-defaults")
        .should("be.visible");
      cy.get('[data-type="Link"').should("be.visible");

      //assert default embedded entities are present and first one is disabled as it reached its max limit
      cy.get("#instance-stencil").within(() => {
        cy.get('[aria-labelledby="bodyTwo_embedded"]').should("be.visible");
        cy.get('[aria-labelledby="bodyTwo_embedded"]').should(
          "have.class",
          "stencil_body-disabled",
        );

        cy.get('[aria-labelledby="bodyTwo_extra_embedded"]').should(
          "be.visible",
        );
        cy.get('[aria-labelledby="bodyTwo_extra_embedded"]').should(
          "have.not.class",
          "stencil_body-disabled",
        );
      });

      cy.get('[aria-label="service-description"').should(
        "have.text",
        "Service entity with many default attributes.",
      );

      //assert that core instance have all attributes, can't be removed
      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("many-defaults")
        .click();
      cy.get("button")
        .contains("span", "Remove")
        .parent()
        .should("be.disabled");
      cy.get("input").should("have.length", 21);

      //fill some of core attributes

      //strings
      cy.get('[aria-label="TextInput-name"]').type("many-defaults");
      cy.get('[aria-label="TextInput-default_string"]').type(
        "{backspace}default_string",
      );
      cy.get('[aria-label="TextInput-default_empty_string"]').type(
        "default_string_1",
      );
      cy.get('[aria-label="TextInput-default_nullable_string"]').type(
        "default_string_2",
      );

      //ints
      cy.get('[aria-label="TextInput-default_int"]').type("{backspace}20");
      cy.get('[aria-label="TextInput-default_empty_int"]').type(
        "{backspace}30",
      );
      cy.get('[aria-label="TextInput-default_nullable_int"]').type(
        "{backspace}40",
      );

      //floats
      cy.get('[aria-label="TextInput-default_float"]').type("{backspace}2.0");
      cy.get('[aria-label="TextInput-default_empty_float"]').type(
        "{backspace}3.0",
      );
      cy.get('[aria-label="TextInput-default_nullable_float"]').type(
        "{backspace}4.0",
      );

      //booleans
      cy.get('[aria-label="BooleanToggleInput-default_bool"]').within(() => {
        cy.get(".pf-v6-c-switch").click();
      });
      cy.get('[aria-label="BooleanToggleInput-default_empty_bool"]').within(
        () => {
          cy.get(".pf-v6-c-switch").click();
        },
      );
      cy.get("#default_nullable_bool-false").click();

      //Dict values
      cy.get('[aria-label="TextInput-default_dict"]').type(
        '{selectAll}{backspace}{{}"test":"value"{}}',
      );
      cy.get('[aria-label="TextInput-default_empty_dict"]').type(
        '{selectAll}{backspace}{{}"test1":"value1"{}}',
      );
      cy.get('[aria-label="TextInput-default_nullable_dict"]').type(
        '{{}"test2":"value2"{}}',
      );

      //assert that embedded instance have all attributes, this particular embedded entity can't be removed but can be edited
      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("embedded")
        .click();
      cy.get("button")
        .contains("span", "Remove")
        .parent()
        .should("be.disabled");
      cy.get("input").should("have.length", 21);

      //fill some of embedded attributes, they are exactly the same as core attributes so we need to check only one fully, as the logic is the same

      //strings
      cy.get('[aria-label="TextInput-name"]').type("embedded");
      cy.get('[aria-label="TextInput-default_string"]').type(
        "{backspace}default_string",
      );
      cy.get('[aria-label="TextInput-default_empty_string"]').type(
        "default_string_1",
      );
      cy.get('[aria-label="TextInput-default_nullable_string"]').type(
        "default_string_2",
      );

      //ints
      cy.get('[aria-label="TextInput-default_int"]').type("{backspace}21");
      cy.get('[aria-label="TextInput-default_empty_int"]').type("{backspace}1");
      cy.get('[aria-label="TextInput-default_nullable_int"]').type(
        "{backspace}41",
      );

      //floats
      cy.get('[aria-label="TextInput-default_float"]').type("{backspace}2.1");
      cy.get('[aria-label="TextInput-default_empty_float"]').type(
        "{backspace}3.1",
      );
      cy.get('[aria-label="TextInput-default_nullable_float"]').type(
        "{backspace}4.1",
      );

      //Drag extra_embedded onto canvas and assert that is highlighted as loose element
      cy.get('[aria-labelledby="bodyTwo_extra_embedded"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 800,
          clientY: 500,
        })
        .trigger("mouseup");

      cy.get(".joint-loose_element-highlight").should("be.visible");

      //assert that extra_embedded instance have all attributes, can be removed
      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("extra_embedded")
        .click();
      cy.get("button").contains("span", "Remove").parent().should("be.enabled");
      cy.get("input").should("have.length", 21);

      //remove extra_embedded instance to simulate that user added that by a mistake yet want to remove it
      cy.get("button").contains("Remove").click();
      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("extra_embedded")
        .should("not.exist");

      //Drag once again extra_embedded onto canvas and assert that is highlighted as loose element
      cy.get('[aria-labelledby="bodyTwo_extra_embedded"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 800,
          clientY: 500,
        })
        .trigger("mouseup");

      cy.get(".joint-loose_element-highlight").should("be.visible");

      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("extra_embedded")
        .click();
      //fill some of embedded attributes, they are exactly the same as core attributes so we need to check only one fully, as the logic is the same

      //strings
      cy.get('[aria-label="TextInput-name"]').type("extra_embedded");
      cy.get('[aria-label="TextInput-default_string"]').type(
        "{backspace}default_string",
      );
      cy.get('[aria-label="TextInput-default_empty_string"]').type(
        "default_string_1",
      );
      cy.get('[aria-label="TextInput-default_nullable_string"]').type(
        "default_string_2",
      );

      //ints
      cy.get('[aria-label="TextInput-default_int"]').type("{backspace}21");
      cy.get('[aria-label="TextInput-default_empty_int"]').type(
        "{backspace}31",
      );
      cy.get('[aria-label="TextInput-default_nullable_int"]').type(
        "{backspace}41",
      );

      //floats
      cy.get('[aria-label="TextInput-default_float"]').type("{backspace}2.1");
      cy.get('[aria-label="TextInput-default_empty_float"]').type(
        "{backspace}3.1",
      );
      cy.get('[aria-label="TextInput-default_nullable_float"]').type(
        "{backspace}4.1",
      );

      //connect core instance with extra_embedded instance
      cy.get('[data-name="fit-to-screen"]').click();
      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("many-defaults")
        .click();
      cy.get('[data-action="link"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 800,
          clientY: 700,
        })
        .trigger("mouseup");

      cy.get('[data-type="Link"]').should("have.length", 2);
      cy.get(".joint-loose_element-highlight").should("not.exist");

      //add parent instance to the canvas and connect it to the core instance
      cy.get("#inventory-tab").click();

      cy.get('[aria-labelledby="bodyTwo_test_name"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 800,
          clientY: 500,
        })
        .trigger("mouseup");

      //highlighted loose element should be visible
      cy.get(".joint-loose_element-highlight").should("be.visible");

      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("many-defaults")
        .click();
      cy.get('[data-action="link"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 800,
          clientY: 500,
        })
        .trigger("mouseup");

      //highlighted loose element should be removed
      cy.get(".joint-loose_element-highlight").should("not.exist");

      cy.get('[data-type="Link"]').should("have.length", 3);

      //add another parent instance to the canvas and connect it to the embedded instance
      cy.get('[data-name="fit-to-screen"]').click();

      cy.get('[aria-labelledby="bodyTwo_test_name2"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 600,
          clientY: 400,
        })
        .trigger("mouseup");
      cy.get('[data-name="fit-to-screen"]').click();
      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("embedded")
        .click();
      cy.get('[data-action="link"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 600,
          clientY: 400,
        })
        .trigger("mouseup");
      cy.get('[data-type="Link"]').should("have.length", 4);

      cy.get("button").contains("Deploy").click();

      //assert that many-defaults is deployed and up

      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);
      // await until parent_service is deployed and up
      cy.get('[data-label="State"]', { timeout: 90000 }).should(
        "have.text",
        "up",
      );

      //check if embedded entities are present and relations are assigned correctly
      cy.get('[aria-label="row actions toggle"]').click();
      cy.get("button").contains("Instance Details").click();

      //check if embedded entities are present and relations are assigned correctly
      cy.get('[aria-label="Expand row 27"]').click(); //toggle extra_embedded
      cy.get('[aria-label="Expand row 28"]').click(); //toggle fist entity of extra_embedded

      cy.get('[aria-label="parent_service_value"]')
        .invoke("text")
        .then((text) => {
          expect(text).to.match(uuidRegex);
        });

      cy.get('[aria-label="embedded.parent_service_value"]')
        .invoke("text")
        .then((text) => {
          expect(text).to.match(uuidRegex);
        });
      cy.get('[aria-label="extra_embedded.0.parent_service_value"]').should(
        "have.text",
        "null",
      );
    });

    it("8.3 composer edit view can perform it's required functions and deploy edited instance", () => {
      // Select 'test' environment
      cy.visit("/console/");
      cy.get(`[aria-label="Select-environment-test"]`).click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]')
        .contains("Service Catalog")
        .click();
      // click on Show Inventory of many-defaults service, expect no instances
      cy.get("#many-defaults", { timeout: 60000 })
        .contains("Show inventory")
        .click();

      cy.get('[aria-label="ServiceInventory-Success"]').should("to.be.visible");
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);
      // click on edit instance with composer
      cy.get('[aria-label="row actions toggle"]').click();
      cy.get("button").contains("Edit in Composer").click();

      // Expect Canvas to be visible
      cy.get(".canvas").should("be.visible");

      //assert if default entities are present, on init on the canvas we should have already basic required structure for the service instance
      cy.get('[data-type="app.ServiceEntityBlock"]').should("have.length", 5);
      cy.get('[data-type="Link"').should("have.length", 4);

      cy.get('[data-type="app.ServiceEntityBlock"]')
        .contains("embedded")
        .should("be.visible");
      cy.get('[data-type="app.ServiceEntityBlock"]')
        .contains("extra_embedded")
        .should("be.visible");
      cy.get('[data-type="app.ServiceEntityBlock"]')
        .contains("many-defaults")
        .should("be.visible");

      //related Services should be disabled from removing
      cy.get('[data-testid="header-parent-service"]').should("have.length", 2);

      cy.get('[data-testid="header-parent-service"]').eq(0).click();
      cy.get("button")
        .contains("span", "Remove")
        .parent()
        .should("be.disabled");

      cy.get('[data-testid="header-parent-service"]').eq(1).click();
      cy.get("button")
        .contains("span", "Remove")
        .parent()
        .should("be.disabled");

      //edit some of core attributes
      cy.get('[data-type="app.ServiceEntityBlock"]')
        .contains("many-defaults")
        .click();

      cy.get('[aria-label="TextInput-default_string"]').type(
        "{selectAll}{backspace}updated_string",
      );
      cy.get('[aria-label="TextInput-default_int"]').type("{backspace}2");
      cy.get('[aria-label="TextInput-default_float"]').type("{backspace}2");
      cy.get('[aria-label="BooleanToggleInput-default_bool"]').within(() => {
        cy.get(".pf-v6-c-switch").click();
      });
      cy.get('[aria-label="TextInput-default_empty_dict"]').type(
        '{selectAll}{backspace}{{}"test2":"value2"{}}',
      );

      //edit some of embedded attributes
      cy.get('[data-type="app.ServiceEntityBlock"]')
        .contains("embedded")
        .click();
      cy.get("button")
        .contains("span", "Remove")
        .parent()
        .should("be.disabled");

      cy.get('[aria-label="TextInput-default_string"]').type(
        "{selectAll}{backspace}updated_string",
      );
      cy.get('[aria-label="TextInput-default_int"]').type("{backspace}2");
      cy.get('[aria-label="TextInput-default_float"]').type("{backspace}2");
      cy.get('[aria-label="BooleanToggleInput-default_bool"]').within(() => {
        cy.get(".pf-v6-c-switch").click();
      });
      cy.get('[aria-label="TextInput-default_empty_dict"]').type(
        '{selectAll}{backspace}{{}"test2":"value2"{}}',
      );

      //remove extra_embedded instance
      cy.get('[data-type="app.ServiceEntityBlock"]')
        .contains("extra_embedded")
        .click();
      cy.get("button").contains("Remove").click();

      cy.get("button").contains("Deploy").click();

      //assert that many-defaults is deployed and up
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);
      // await until parent_service is deployed and up
      cy.get('[data-label="State"]', { timeout: 90000 }).should(
        "have.text",
        "up",
      );

      cy.get('[aria-label="ServiceInventory-Success"]').should("to.be.visible");
      //assert that many-defaults is deployed and up
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);
      // await until parent_service is deployed and up
      cy.get('[data-label="State"]', { timeout: 90000 }).should(
        "have.text",
        "up",
      );

      //check if core attributes and embedded entities are updated
      cy.get('[aria-label="row actions toggle"]').click();
      cy.get("button").contains("Instance Details").click();

      //Go to candidate attributes and assert that they are updated
      cy.get('[aria-label="Select-AttributeSet"]').select(
        "candidate_attributes",
      );
      cy.get('[aria-label="default_int_value"]').should("have.text", "22");

      cy.get('[aria-label="default_string_value"]').should(
        "have.text",
        "updated_string",
      );

      cy.get('[aria-label="Expand row 1"]').click(); //toggle embedded

      cy.get('[aria-label="embedded.default_int_value"]').should(
        "have.text",
        "22",
      );
      cy.get('[aria-label="embedded.default_float_value"]').should(
        "have.text",
        "2",
      );
      cy.get('[aria-label="embedded.default_string_value"]').should(
        "have.text",
        "updated_string",
      );

      cy.get('[aria-label="extra_embedded_value"]').should("have.text", "[]");
    });

    it("8.4 composer edit view is able to edit instances relations", () => {
      // Select 'test' environment
      cy.visit("/console/");
      cy.get(`[aria-label="Select-environment-test"]`).click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]')
        .contains("Service Catalog")
        .click();
      // click on Show Inventory of many-defaults service, expect no instances
      cy.get("#child-service", { timeout: 60000 })
        .contains("Show inventory")
        .click();
      cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");
      // click on add instance with composer
      cy.get('[aria-label="AddInstanceToggle"]').click();
      cy.get("#add-instance-composer-button").click();

      // Expect Canvas to be visible
      cy.get(".canvas").should("be.visible");

      cy.get("main").scrollTo("bottom"); //scroll to the bottom as the error container is clipped in 1500x900 viewport
      //Assert error message is visible as there is missing relation
      cy.get('[data-testid="Error-container"]').should("be.visible");
      cy.get('[data-testid="Error-container"]').should(
        "have.text",
        "Danger alert:Errors found: 1",
      );
      cy.get('[aria-label="Danger alert details"]').click();
      cy.get(
        '[aria-label="missingRelationsParagraph-child-service_parent-service_0"]',
      ).should(
        "have.text",
        "Expected at least 1 parent-service inter-service relation(s) for child-service",
      );

      //assert if default entities are present, on init on the canvas we should have already basic required structure for the service instance
      cy.get('[data-type="app.ServiceEntityBlock"').should("have.length", 1);

      cy.get('[data-type="app.ServiceEntityBlock"]').click();
      cy.get("button")
        .contains("span", "Remove")
        .parent()
        .should("be.disabled");

      cy.get('[aria-label="TextInput-name"]').type("test_child");
      cy.get('[aria-label="TextInput-service_id"]').type("test_child_id");

      //add parent instance to the canvas and connect it to the core instance
      cy.get("#inventory-tab").click();

      cy.get('[aria-labelledby="bodyTwo_test_name"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 800,
          clientY: 600,
        })
        .trigger("mouseup");

      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("child-service")
        .click();
      cy.get('[data-action="link"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 800,
          clientY: 600,
        })
        .trigger("mouseup");

      cy.get('[data-type="Link"]').should("have.length", 1);

      cy.get("button").contains("Deploy").click();
      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);
      // await until parent_service is deployed and up
      cy.get('[data-label="State"]', { timeout: 90000 }).should(
        "have.text",
        "up",
      );

      //check if relation is assigned correctly
      cy.get('[aria-label="row actions toggle"]').click();
      cy.get("button").contains("Instance Details").click();

      let oldUuid = "";

      cy.get('[aria-label="parent_entity_value"]')
        .invoke("text")
        .then((text) => {
          expect(text).to.match(uuidRegex);
          oldUuid = text;
        });
      cy.wait(1000); // wait for the async assertion

      // click on edit instance with composer
      cy.get('[aria-label="Actions-Toggle"]').click();
      cy.get("button").contains("Edit in Composer").click();

      // Expect Canvas to be visible
      cy.get(".canvas").should("be.visible");

      //assert if default entities are present, on init on the canvas we should have already basic required structure for the service instance
      cy.get('[data-type="app.ServiceEntityBlock"]').should("have.length", 2);
      cy.get('[data-type="Link"').should("have.length", 1);

      cy.get('[data-type="app.ServiceEntityBlock"]')
        .contains("parent-service")
        .click();
      cy.get("button").contains("Remove").click();

      //add parent instance to the canvas and connect it to the core instance
      cy.get("#inventory-tab").click();

      //click on core instance to focus canvas view near it
      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("child-service")
        .click();

      cy.get('[aria-labelledby="bodyTwo_test_name2"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 800,
          clientY: 500,
        })
        .trigger("mouseup");

      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("child-service")
        .click();
      cy.get('[data-action="link"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 800,
          clientY: 500,
        })
        .trigger("mouseup");

      cy.get('[data-testid="Error-container"]').should("not.exist");

      cy.get("button").contains("Deploy").click();

      // await until parent_service is deployed and up
      cy.get('[data-label="State"]', { timeout: 90000 }).should(
        "have.text",
        "up",
      );

      //check if relation is updated correctly
      cy.get('[aria-label="row actions toggle"]').click();
      cy.get("button").contains("Instance Details").click();
      cy.get('[data-testid="selected-version"]').should(
        "have.text",
        "Version: 8",
      ); // initial open of the details view will show the outdated version

      cy.get('[aria-label="parent_entity_value"]')
        .invoke("text")
        .then((text) => {
          expect(text).to.match(uuidRegex);
          expect(text).to.not.be.equal(oldUuid);
        });
    });

    it("8.5 composer edit view is able to remove inter-service relation from instance", () => {
      // Select 'test' environment
      cy.visit("/console/");

      cy.get(`[aria-label="Select-environment-test"]`).click();
      cy.get('[aria-label="Sidebar-Navigation-Item"]')
        .contains("Service Catalog")
        .click();

      // click on Show Inventory of many-defaults service, expect no instances
      cy.get("#child-with-many-parents-service", { timeout: 60000 })
        .contains("Show inventory")
        .click();
      cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");
      // click on add instance with composer
      cy.get('[aria-label="AddInstanceToggle"]').click();
      cy.get("#add-instance-composer-button").click();

      //fill child attributes
      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("child-with-many")
        .click();
      cy.get('[aria-label="TextInput-name"]').type("child_test");
      cy.get('[aria-label="TextInput-service_id"]').type("child_test_id");

      //add parent instances to the canvas and connect them to the core instance
      cy.get("#inventory-tab").click();

      //add first inter-service relation
      cy.get('[aria-labelledby="bodyTwo_test_name"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 800,
          clientY: 500,
        })
        .trigger("mouseup");

      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("child-with-many")
        .click();
      cy.get('[data-action="link"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 800,
          clientY: 600,
        })
        .trigger("mouseup");

      //add second inter-service relation
      cy.get('[aria-labelledby="bodyTwo_test_name2"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 800,
          clientY: 700,
        })
        .trigger("mouseup");

      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("child-with-many")
        .click();
      cy.get('[data-action="link"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 800,
          clientY: 800,
        })
        .trigger("mouseup");

      cy.get('[data-type="Link"]').should("have.length", 2);

      cy.get("button").contains("Deploy").click();

      cy.get('[data-label="State"]', { timeout: 90000 })
        .eq(0, { timeout: 90000 })
        .should("have.text", "up", { timeout: 90000 });

      // click on edit instance with composer
      cy.get('[aria-label="row actions toggle"]').click();
      cy.get("button").contains("Edit in Composer").click();

      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("test_name2")
        .click();

      cy.get("button").contains("Remove").click();
      cy.get("button").contains("Deploy").click();

      cy.get('[data-label="State"]', { timeout: 90000 })
        .eq(0, { timeout: 90000 })
        .should("have.text", "up", { timeout: 90000 });

      //go to details view
      cy.get('[aria-label="row actions toggle"]').click();
      cy.get("button").contains("Instance Details").click();

      //assert that in Active attribute we have only 1 relation
      cy.get('[aria-label="Expand row 2"]').click();

      cy.get('[data-testid="0"]')
        .invoke("text")
        .then((text) => {
          expect(text).to.match(uuidRegex);
        });

      cy.get('[data-testid="1"]').should("not.exist");

      //assert that in Rollback attribute we have 2 relations
      cy.get('[aria-label="Select-AttributeSet"]').select(
        "rollback_attributes",
      );

      cy.get('[data-testid="0"]')
        .invoke("text")
        .then((text) => {
          expect(text).to.match(uuidRegex);
        });

      cy.get('[data-testid="1"]')
        .invoke("text")
        .then((text) => {
          expect(text).to.match(uuidRegex);
        });
    });
  });
}
