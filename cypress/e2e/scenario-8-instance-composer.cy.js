//TODO: tests are commented out as there is ongoing redesign of the instance composer which will affect how the user interact with it and how e2e test should look like

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
  describe("Scenario 8 - Instance Composer", async () => {
    before(() => {
      clearEnvironment();
      forceUpdateEnvironment();
    });

    //Note: trying to toggle fullscreen mode causing in typeError: permission denied, assertion about fullscreen API is not possible, and it's done in Jest test case
    it("8.1 composer opens up has it's default navigation working", () => {
      // Select 'test' environment
      cy.visit("/console/");
      cy.get('[aria-label="Environment card"]')
        .contains("lsm-frontend")
        .click();
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();

      // click on Show Inventory on embedded-entity-service-extra, expect no instances
      cy.get("#container-service", { timeout: 60000 })
        .contains("Show inventory")
        .click();
      cy.get('[aria-label="ServiceInventory-Empty"]').should("to.be.visible");
      // click on add instance with composer
      cy.get('[aria-label="AddInstanceToggle"]').click();
      cy.get("#add-instance-composer-button").click();

      // Expect Canvas to be visible adn default instances to be present
      cy.get(".canvas").should("be.visible");
      cy.get('[data-type="app.ServiceEntityBlock"').should("have.length", 2);

      //expect Zoom Handler and it's all component visible and in default state
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
      cy.get(".stencil-sidebar").should("be.visible");
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

    it("8.2 composer is able to create instance", () => {
      // Select 'test' environment
      cy.visit("/console/");
      cy.get('[aria-label="Environment card"]')
        .contains("lsm-frontend")
        .click();
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();

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

      //assert that core instance have all attributes, can't be removed and can be edited
      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("parent-service")
        .click();

      //fill parent attributes
      cy.get("button").contains("Edit").click();
      cy.get('[aria-label="TextInput-name"]').type("test_name");
      cy.get('[aria-label="TextInput-service_id"]').type("test_id");
      cy.get("button").contains("Save").click();

      cy.get("button").contains("Deploy").click();

      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);
      // await until parent_service is deployed and up
      cy.get('[data-label="State"]', {
        timeout: 90000,
      }).should("have.text", "up");

      //add another parent instance
      cy.get('[aria-label="AddInstanceToggle"]').click();
      cy.get("#add-instance-composer-button").click();
      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("parent-service")
        .click();

      //fill parent attributes
      cy.get("button").contains("Edit").click();
      cy.get('[aria-label="TextInput-name"]').type("test_name2");
      cy.get('[aria-label="TextInput-service_id"]').type("test_id2");
      cy.get("button").contains("Save").click();

      cy.get("button").contains("Deploy").click();

      cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 2);
      // await until parent_service is deployed and up
      cy.get('[data-label="State"]', { timeout: 90000 })
        .eq(0, { timeout: 90000 })
        .should("have.text", "up");

      //Add child_service instance
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();
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

      //assert if default entities are present
      cy.get('[data-type="app.ServiceEntityBlock"').should("have.length", 2);
      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("embedded")
        .should("be.visible");
      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("many-defaults")
        .should("be.visible");
      cy.get('[data-type="Link"').should("be.visible");

      //assert default embedded entities are present and first one is disabled as it reached it max limit
      cy.get("#instance-stencil").within(() => {
        cy.get(".embedded_bodyTwo").should("be.visible");
        cy.get(".embedded_bodyTwo").should(
          "have.class",
          "stencil_body-disabled",
        );

        cy.get(".extra_embedded_bodyTwo").should("be.visible");
        cy.get(".extra_embedded_bodyTwo").should(
          "have.not.class",
          "stencil_body-disabled",
        );
      });

      cy.get('[aria-label="service-description"').should(
        "have.text",
        "Service entity with many default attributes.",
      );

      //assert that core instance have all attributes, can't be removed and can be edited
      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("many-defaults")
        .click();
      cy.get("button").contains("Remove").should("be.disabled");
      cy.get("button").contains("Edit").should("be.enabled");
      cy.get("input").should("have.length", 21);

      //fill some of core attributes
      cy.get("button").contains("Edit").click();

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
        cy.get(".pf-v5-c-switch").click();
      });
      cy.get('[aria-label="BooleanToggleInput-default_empty_bool"]').within(
        () => {
          cy.get(".pf-v5-c-switch").click();
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

      cy.get("button").contains("Save").click();

      //assert that embedded instance have all attributes, can't be removed and can be edited
      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("embedded")
        .click();
      cy.get("button").contains("Remove").should("be.disabled");
      cy.get("button").contains("Edit").should("be.enabled");
      cy.get("input").should("have.length", 21);

      //fill some of embedded attributes, they are exactly the same as core attributes so we need to check only one fully, as the logic is the same
      cy.get("button").contains("Edit").click();

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

      cy.get("button").contains("Save").click();

      //Drag extra_embedded onto canvas and assert that is highlighted as loose element
      cy.get(".extra_embedded_bodyTwo")
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 800,
          clientY: 500,
        })
        .trigger("mouseup");

      cy.get(".joint-loose_element-highlight").should("be.visible");

      //assert that extra_embedded instance have all attributes, can be removed and can be edited
      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("extra_embedded")
        .click();
      cy.get("button").contains("Remove").should("be.enabled");
      cy.get("button").contains("Edit").should("be.enabled");
      cy.get("input").should("have.length", 21);

      //fill some of embedded attributes, they are exactly the same as core attributes so we need to check only one fully, as the logic is the same
      cy.get("button").contains("Edit").click();

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

      cy.get("button").contains("Save").click();

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
          clientY: 500,
        })
        .trigger("mouseup");

      cy.get('[data-type="Link"]').should("have.length", 2);
      cy.get(".joint-loose_element-highlight").should("not.exist");

      //add parent instance to the canvas and connect it to the core instance
      cy.get("#inventory-tab").click();

      cy.get(".test_name_bodyTwo")
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 800,
          clientY: 600,
        })
        .trigger("mouseup");

      cy.get('[data-type="app.ServiceEntityBlock"')
        .contains("many-defaults")
        .click();
      cy.get('[data-action="link"]')
        .trigger("mouseover")
        .trigger("mousedown")
        .trigger("mousemove", {
          clientX: 800,
          clientY: 600,
        })
        .trigger("mouseup");

      cy.get('[data-type="Link"]').should("have.length", 3);

      //add another parent instance to the canvas and connect it to the embedded instance
      cy.get('[data-name="fit-to-screen"]').click();

      cy.get(".test_name2_bodyTwo")
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
      cy.get("#expand-toggle0").click();
      cy.get("button").contains("Attributes").click();

      cy.get('[aria-label="Toggle-embedded"]').click();

      cy.get('[aria-label="Toggle-extra_embedded"]').click();
      cy.get('[aria-label="Toggle-extra_embedded$0"]').click();

      cy.get('[aria-label="Row-parent_service"]').within(() => {
        cy.get('[data-label="active"]').should("have.text", "test_name");
      });
      cy.get('[aria-label="Row-embedded$parent_service"]').within(() => {
        cy.get('[data-label="active"]').should("have.text", "test_name2");
      });
      cy.get('[aria-label="Row-extra_embedded$0$parent_service"]').within(
        () => {
          cy.get('[data-label="active"]').should("have.text", "null");
        },
      );
    });

    it("8.3 composer is able to edit instances attributes", () => {
      // Select 'test' environment
      cy.visit("/console/");
      cy.get('[aria-label="Environment card"]')
        .contains("lsm-frontend")
        .click();
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();
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

      //assert if default entities are present
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

      //related Services should be disabled from editing and removing
      cy.get('[data-testid="header-parent-service"]').should("have.length", 2);

      cy.get('[data-testid="header-parent-service"]').eq(0).click();
      cy.get("button").contains("Remove").should("be.disabled");
      cy.get("button").contains("Edit").should("be.disabled");

      cy.get('[data-testid="header-parent-service"]').eq(1).click();
      cy.get("button").contains("Remove").should("be.disabled");
      cy.get("button").contains("Edit").should("be.disabled");

      //edit some of core attributes
      cy.get('[data-type="app.ServiceEntityBlock"]')
        .contains("many-defaults")
        .click();
      cy.get("button").contains("Edit").should("be.enabled");
      cy.get("button").contains("Edit").click();

      cy.get('[aria-label="TextInput-default_string"]').type(
        "{selectAll}{backspace}updated_string",
      );
      cy.get('[aria-label="TextInput-default_int"]').type("{backspace}2");
      cy.get('[aria-label="TextInput-default_float"]').type("{backspace}2");
      cy.get('[aria-label="BooleanToggleInput-default_bool"]').within(() => {
        cy.get(".pf-v5-c-switch").click();
      });
      cy.get('[aria-label="TextInput-default_empty_dict"]').type(
        '{selectAll}{backspace}{{}"test2":"value2"{}}',
      );
      cy.get("button").contains("Save").click();

      //edit some of embedded attributes
      cy.get('[data-type="app.ServiceEntityBlock"]')
        .contains("embedded")
        .click();
      cy.get("button").contains("Remove").should("be.disabled");
      cy.get("button").contains("Edit").should("be.enabled");
      cy.get("button").contains("Edit").click();

      cy.get('[aria-label="TextInput-default_string"]').type(
        "{selectAll}{backspace}updated_string",
      );
      cy.get('[aria-label="TextInput-default_int"]').type("{backspace}2");
      cy.get('[aria-label="TextInput-default_float"]').type("{backspace}2");
      cy.get('[aria-label="BooleanToggleInput-default_bool"]').within(() => {
        cy.get(".pf-v5-c-switch").click();
      });
      cy.get('[aria-label="TextInput-default_empty_dict"]').type(
        '{selectAll}{backspace}{{}"test2":"value2"{}}',
      );
      cy.get("button").contains("Save").click();

      //remove extra_embedded instance
      cy.get('[data-type="app.ServiceEntityBlock"]')
        .contains("extra_embedded")
        .click();
      cy.get("button").contains("Remove").should("be.enabled");
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
      cy.get("#expand-toggle0").click();
      cy.get("button").contains("Attributes").click();

      cy.get('[aria-label="Row-default_int"]').within(() => {
        cy.get('[data-label="active"]').should("have.text", "20");
        cy.get('[data-label="candidate"]').should("have.text", "22");
      });

      cy.get('[aria-label="Row-default_string"]').within(() => {
        cy.get('[data-label="active"]').should("have.text", "default_string");
        cy.get('[data-label="candidate"]').should(
          "have.text",
          "updated_string",
        );
      });

      cy.get('[aria-label="Toggle-embedded"]').click();

      cy.get('[aria-label="Row-embedded$default_int"]').within(() => {
        cy.get('[data-label="active"]').should("have.text", "21");
        cy.get('[data-label="candidate"]').should("have.text", "22");
      });

      cy.get('[aria-label="Row-embedded$default_float"]').within(() => {
        cy.get('[data-label="active"]').should("have.text", "2.1");
        cy.get('[data-label="candidate"]').should("have.text", "2");
      });

      cy.get('[aria-label="Row-embedded$default_string"]').within(() => {
        cy.get('[data-label="active"]').should("have.text", "default_string");
        cy.get('[data-label="candidate"]').should(
          "have.text",
          "updated_string",
        );
      });

      //assert that extra_embedded attrs are empty as instance was removed
      cy.get('[aria-label="Toggle-extra_embedded"]').click();
      cy.get('[aria-label="Toggle-extra_embedded$0"]').click();

      cy.get('[aria-label="Row-extra_embedded$0$default_int"]').within(() => {
        cy.get('[data-label="active"]').should("have.text", "21");
        cy.get('[data-label="candidate"]').should("have.text", "");
      });

      cy.get('[aria-label="Row-extra_embedded$0$default_float"]').within(() => {
        cy.get('[data-label="active"]').should("have.text", "2.1");
        cy.get('[data-label="candidate"]').should("have.text", "");
      });

      cy.get('[aria-label="Row-extra_embedded$0$default_string"]').within(
        () => {
          cy.get('[data-label="active"]').should("have.text", "default_string");
          cy.get('[data-label="candidate"]').should("have.text", "");
        },
      );
    });

    it("8.4 composer is able to edit instances relations", () => {
      // Select 'test' environment
      cy.visit("/console/");
      cy.get('[aria-label="Environment card"]')
        .contains("lsm-frontend")
        .click();
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();
      cy.get(".pf-v5-c-nav__item").contains("Service Catalog").click();
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

      //assert if default entities are present
      cy.get('[data-type="app.ServiceEntityBlock"').should("have.length", 1);

      cy.get('[data-type="app.ServiceEntityBlock"]').click();
      cy.get("button").contains("Remove").should("be.disabled");
      cy.get("button").contains("Edit").should("be.enabled");
      cy.get("button").contains("Edit").click();

      cy.get('[aria-label="TextInput-name"]').type("test_child");
      cy.get('[aria-label="TextInput-service_id"]').type("test_child_id");
      cy.get("button").contains("Save").click();

      //add parent instance to the canvas and connect it to the core instance
      cy.get("#inventory-tab").click();

      cy.get(".test_name_bodyTwo")
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
      cy.get("#expand-toggle0").click();
      cy.get("button").contains("Attributes").click();

      cy.get('[aria-label="Row-parent_entity"]').within(() => {
        cy.get('[data-label="active"]').should("have.text", "test_name");
      });

      // click on edit instance with composer
      cy.get('[aria-label="row actions toggle"]').click();
      cy.get("button").contains("Edit in Composer").click();

      // Expect Canvas to be visible
      cy.get(".canvas").should("be.visible");

      //assert if default entities are present
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

      cy.get(".test_name2_bodyTwo")
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

      cy.get("button").contains("Deploy").click();

      // await until parent_service is deployed and up
      cy.get('[data-label="State"]', { timeout: 90000 }).should(
        "have.text",
        "up",
      );

      //check if relation is assigned correctly
      cy.get("button").contains("Attributes").click();

      cy.get('[aria-label="Row-parent_entity"]').within(() => {
        cy.get('[data-label="active"]').should("have.text", "test_name2");
      });
    });
  });
}
