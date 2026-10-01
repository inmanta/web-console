import environmentHelpers from "../support/environmentHelpers.js";

const { clearEnvironment, forceUpdateEnvironment, selectEnvironment } = environmentHelpers;

const isIso = Cypress.expose("edition") === "iso";

const SERVICE = "references-showcase-service";
const INSTANCE_NAME = "test";
const SHOWCASE_RESOURCE_NAME = `references-showcase-${INSTANCE_NAME}`;
const FACT_SOURCE_ID = `frontend_model::references_showcase::FactSourceResource[internal,name=references-showcase-fact-source-${INSTANCE_NAME}]`;

/**
 * Open the details page of the showcase resource from the Resources page. The resource only
 * shows up after the instance's chain of lsm compiles (about 50s locally), so the row gets a
 * generous timeout.
 */
const openShowcaseResource = () => {
  cy.visit("/console/");
  selectEnvironment();
  cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Resources").click();
  cy.contains('[aria-label="Resource Table Row"]', SHOWCASE_RESOURCE_NAME, { timeout: 120000 })
    .find("a")
    .contains("Show Details")
    .click();
  cy.get('[data-testid="attribute-token"]').should("be.visible");
};

/**
 * The expand toggle of a reference node inside an attribute's value cell. The toggle is labelled
 * with the node's summary, so a prefix of it is enough to pick the node.
 *
 * @param {string} attribute - the attribute key (e.g. "token")
 * @param {string} summary - the start of the node's summary (e.g. "std::Environment")
 */
const referenceToggle = (attribute, summary) =>
  cy.get(`[data-testid="attribute-${attribute}"]:visible`).find(`button[aria-label^="${summary}"]`);

/**
 * The rendered value of one argument inside an expanded reference node, found by its exact name.
 *
 * @param {string} attribute - the attribute key holding the node (e.g. "demo")
 * @param {string} name - the argument name (e.g. "password")
 */
const argumentValue = (attribute, name) =>
  cy.contains(`[data-testid="attribute-${attribute}"] dt`, new RegExp(`^${name}$`)).next("dd");

if (isIso) {
  describe("Scenario 7 : References in the desired state (references-showcase-service)", () => {
    before(() => {
      clearEnvironment();
      forceUpdateEnvironment();
    });

    it("7.1 Add an instance on the references showcase service", () => {
      cy.visit("/console/");
      selectEnvironment();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
      cy.get(`#${SERVICE}`, { timeout: 60000 }).contains("Show inventory").click();
      cy.get("#add-instance-button", { timeout: 60000 }).click();
      cy.get("#name").type(INSTANCE_NAME);

      // A rejected create (e.g. a 409 when the instance already exists) fails here with its
      // status, instead of as a missing details page.
      cy.intercept("POST", `**/lsm/v1/service_inventory/${SERVICE}`).as("CreateInstance");
      cy.get("button").contains("Confirm").click();
      cy.wait("@CreateInstance").its("response.statusCode").should("eq", 200);

      cy.get('[aria-label="Instance-Details-Success"]', { timeout: 20000 }).should("be.visible");

      openShowcaseResource();
    });

    it("7.2 Whole and nested references show where the value comes from", () => {
      openShowcaseResource();

      // A whole-attribute reference replaces the null with a chip that expands to its arguments
      cy.get('[data-testid="attribute-token"]').should("not.contain", "null");
      referenceToggle("token", "std::Environment(name=NETBOX_API_TOKEN)").click();
      argumentValue("token", "name").should("have.text", "NETBOX_API_TOKEN");

      // The expansion is kept in the url, so it survives a reload
      cy.location("search").should("contain", "references");
      cy.reload();
      argumentValue("token", "name").should("have.text", "NETBOX_API_TOKEN");

      // A nested reference keeps the stored value and lists the jsonpath it fills beneath it
      cy.get('[data-testid="attribute-api"]')
        .should("contain", "api.'api_token'")
        .and("contain", "std::Environment(name=CLOUDSMITH_API_KEY)");
      cy.get('[data-testid="attribute-credentials"]')
        .should("contain", "credentials.'username'")
        .and("contain", "std::Environment(name=SERVICE_USERNAME)")
        .and("contain", "credentials.'password'")
        .and("contain", "std::Environment(name=SERVICE_PASSWORD)");

      // The reference machinery keys are not listed as attributes
      cy.get('[data-testid="attribute-mutators"]').should("not.exist");
      cy.get('[data-testid="attribute-references"]').should("not.exist");
    });

    it("7.3 Reference arguments render by kind and nest", () => {
      openShowcaseResource();

      // Literal, json and python type arguments, with the password masked
      referenceToggle("demo", "frontend_model::showcase::AllKinds").click();
      argumentValue("demo", "a_literal").should("have.text", "hello world");
      argumentValue("demo", "a_json").find(".monaco-editor").should("exist");
      argumentValue("demo", "a_type").should("have.text", "str");
      argumentValue("demo", "password").should("have.text", "****");
      cy.get('[data-testid="attribute-demo"]').should("not.contain", "s3cr3t-value");

      // An mjson argument lists one child node per destination, and each child expands again
      referenceToggle("value", "frontend_model::showcase::Report").click();
      ["SECRET_A", "SECRET_B", "SECRET_C"].forEach((secret, index) => {
        cy.get('[data-testid="attribute-value"]')
          .should("contain", `$[${index}]`)
          .and("contain", `frontend_model::showcase::Section(label=section-${secret})`);
      });
      // A multiline literal argument renders as a code block. Monaco renders spaces as
      // non-breaking spaces, so normalize them before matching.
      argumentValue("value", "template")
        .find(".view-lines")
        .invoke("text")
        .should((text) => {
          expect(text.replace(/\u00a0/g, " ")).to.contain("# Compliance report");
        });

      referenceToggle("value", "frontend_model::showcase::Section(label=section-SECRET_A)").click();
      referenceToggle("value", "frontend_model::showcase::Secret(name=secret-SECRET_A)").should(
        "be.visible"
      );

      // A deep chain stops at the depth cap instead of rendering forever
      for (let level = 1; level <= 10; level++) {
        referenceToggle("chain", `frontend_model::showcase::Link(label=link-${level})`).click();
      }
      cy.get('[data-testid="attribute-chain"]').should(
        "contain",
        "Reference tree truncated at 10 levels"
      );
    });

    it("7.4 A resource argument links to that resource", () => {
      openShowcaseResource();

      referenceToggle("target", "frontend_model::showcase::ResourceTarget").click();
      cy.get('[data-testid="attribute-target"]').contains("a", FACT_SOURCE_ID).click();

      // The link text is on the old page too, so check that we actually navigated
      cy.location("pathname").should("contain", "FactSourceResource");
      cy.get('[data-testid="attribute-target"]').should("not.exist");
      cy.contains('[role="tab"][aria-selected="true"]', "Desired State").should("be.visible");
    });

    it("7.5 A fact reference links to the Facts tab of the resource it reads from", () => {
      openShowcaseResource();

      referenceToggle("fact", "std::FactReference").click();
      cy.get('[data-testid="attribute-fact"]').should("contain", "ip_address");
      cy.get('[data-testid="attribute-fact"]').contains("a", FACT_SOURCE_ID).click();

      cy.location("pathname").should("contain", "FactSourceResource");
      cy.contains('[role="tab"][aria-selected="true"]', "Facts").should("be.visible");
      // The fact is published once the fact source resource is deployed
      cy.contains('[aria-label="Facts table row"]', "ip_address", { timeout: 60000 }).should(
        "contain",
        "10.0.0.1"
      );
    });

    it("7.6 The JSON view shows the raw payload", () => {
      openShowcaseResource();

      cy.get("#json").click();
      cy.get(".monaco-editor", { timeout: 15000 }).should("be.visible");
      // Monaco renders spaces as non-breaking spaces, so normalize them before matching
      cy.get(".view-lines")
        .invoke("text")
        .should((text) => {
          const normalized = text.replace(/\u00a0/g, " ");

          expect(normalized).to.contain('"token": null');
          expect(normalized).to.contain('"mutators": [');
        });

      cy.get("#structured").click();
      cy.get('[data-testid="attribute-token"]').should(
        "contain",
        "std::Environment(name=NETBOX_API_TOKEN)"
      );
    });

    it("7.7 The history tab shows references the same way", () => {
      openShowcaseResource();

      cy.get("button").contains("History").click();
      cy.get('[aria-label="Resource History Table Row"]').should("have.length.at.least", 1);
      cy.get('[aria-label="Resource History Table Row"]')
        .first()
        .find('[aria-label="Details"]')
        .click();

      referenceToggle("token", "std::Environment(name=NETBOX_API_TOKEN)").click();
      cy.get('[data-testid="attribute-token"]:visible').should("contain", "NETBOX_API_TOKEN");
    });

    it("7.8 The versioned resource page shows references the same way", () => {
      cy.visit("/console/");
      selectEnvironment();
      cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Desired State").click();
      cy.get('[aria-label="DesiredStatesView-Success"]', { timeout: 60000 })
        .find("tbody")
        .eq(0)
        .contains("Show Resources")
        .click();

      cy.contains("button", "Filters").click();
      cy.get('[aria-label="Type"]').type("ShowcaseResource{enter}");
      cy.get('[aria-label="VersionResourcesTable-Success"]')
        .find("tbody")
        .should("have.length", 1)
        .and("contain", SHOWCASE_RESOURCE_NAME)
        .contains("Show Details")
        .click();

      referenceToggle("token", "std::Environment(name=NETBOX_API_TOKEN)").click();
      cy.get('[data-testid="attribute-token"]').should("contain", "NETBOX_API_TOKEN");
    });
  });
}
