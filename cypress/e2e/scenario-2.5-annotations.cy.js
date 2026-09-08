import environmentHelpers from "../support/environmentHelpers.js";

const { clearEnvironment, forceUpdateEnvironment, selectEnvironment } = environmentHelpers;

/**
 * Scenario 2.5 - Annotation-driven service form improvements (epic #7007, coverage #7127).
 *
 * Runs against the `suggestions-showcase-service` from the front-end-lsm-test-model, which
 * exercises every form-annotation variant in one generated form:
 *   T1 label/value split ......... bandwidth + tags (label/value pairs), encapsulation (bare)
 *   T2 parameter variables ....... region (static), template_name (${entity_type})
 *   T3 graphql flavor ............ environment_ref (graphql over environments)
 *   T4 cascading fields .......... site -> uplink (${form.site})
 *   T5 form tabs ................. General / Network / Advanced / Errors
 *   §6 unit input fields ......... memory_limit / disk_quota / bandwidth_limit / transfer_rate /
 *                                  session_timeout / average_throughput (issue #7022)
 *   §7 model-error examples ...... the "Errors" tab (broken annotations, one error each)
 *
 * The exact suggestion values (e.g. "10 Gbps" -> "10000") and field-to-tab assignments come
 * straight from the model, so they are asserted literally here.
 */

const SERVICE = "suggestions-showcase-service";

beforeEach(() => {
  localStorage.setItem("theme-preference", "light");
});

const isIso = Cypress.expose("edition") === "iso";

/**
 * Open the Service Catalog and start the "Add instance" form for the showcase service.
 */
const openAddInstanceForm = () => {
  cy.visit("/console/");
  selectEnvironment();
  cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
  cy.get(`#${SERVICE}`, { timeout: 60000 }).contains("Show inventory").click();
  cy.get("#add-instance-button", { timeout: 60000 }).click();
};

/**
 * Every tab's fields stay in the DOM (PatternFly only hides the inactive panels), so we key off
 * visibility, not existence: open whichever tab makes the given field visible. Does nothing if the
 * field is already visible.
 *
 * @param {string} selector - a css selector for the field (e.g. "#region")
 */
const openTabWithField = (selector) => {
  cy.get("body").then(($body) => {
    if ($body.find(`${selector}:visible`).length > 0) {
      return;
    }

    const clickThrough = (index) => {
      cy.get('[aria-label="Instance-Form-Tabs"]')
        .find('[role="tab"]')
        .then(($tabs) => {
          if (index >= $tabs.length) {
            return;
          }
          cy.wrap($tabs.eq(index)).click();
          cy.get("body").then(($after) => {
            if ($after.find(`${selector}:visible`).length === 0) {
              clickThrough(index + 1);
            }
          });
        });
    };

    clickThrough(0);
  });
};

/**
 * Open the suggestions popover on a single-text field and clear its current value so the full,
 * unfiltered option list is shown (fields with a default would otherwise filter to that value).
 *
 * @param {string} selector - the field selector (e.g. "#bandwidth")
 */
const openSuggestions = (selector) => {
  cy.get(selector).click();
  cy.get(selector).clear();
  cy.contains("h3", "Suggested values").should("be.visible");
};

/**
 * The unit `<select>` that sits next to a unit field's number input (both share one InputGroup).
 *
 * @param {string} name - the attribute name (e.g. "memory_limit")
 */
const unitSelect = (name) =>
  cy.get(`#${name}`).closest(".pf-v6-c-input-group").find('[aria-label="Unit"]');

if (isIso) {
  describe("Scenario 2.5 Service Catalog - annotation-driven form (suggestions-showcase-service)", () => {
    before(() => {
      clearEnvironment();
      forceUpdateEnvironment();
    });

    it("2.5.1 - the form is split into tabs, unassigned fields fall on the default tab", () => {
      openAddInstanceForm();

      // Four tabs, in model `order`: General (default), Network, Advanced, Errors.
      cy.get('[aria-label="Instance-Form-Tabs"]').should("be.visible");
      cy.get('[aria-label="Instance-Form-Tabs"]').find('[role="tab"]').should("have.length", 4);
      cy.contains('[role="tab"]', "General").should("be.visible");
      cy.contains('[role="tab"]', "Network").should("be.visible");
      cy.contains('[role="tab"]', "Advanced").should("be.visible");
      cy.contains('[role="tab"]', "Errors").should("be.visible");

      // General is the default tab and is active on open: the fields with no web_tab assignment
      // (name, service_id) render there without any tab switching.
      cy.get("#name").should("be.visible");
      cy.get("#service_id").should("be.visible");

      // A network-tab field is hidden until its tab is active (its panel stays in the DOM), then
      // it becomes visible.
      cy.get("#bandwidth:visible").should("not.exist");
      cy.contains('[role="tab"]', "Network").click();
      cy.get("#bandwidth").should("be.visible");

      cy.get("button").contains("Cancel").click();
    });

    it("2.5.2 - the dropdown shows friendly labels while the form submits the machine values (single + list)", () => {
      // Stub the create so the assertion runs on the request without persisting an instance.
      cy.intercept("POST", `/lsm/v1/service_inventory/${SERVICE}`, (req) =>
        req.reply({ statusCode: 400, body: { message: "e2e stub - not persisted" } })
      ).as("CreateInstance");

      openAddInstanceForm();

      // bandwidth carries {label, value} pairs: the option and the input show the label, the form
      // stores the value.
      openTabWithField("#bandwidth");
      openSuggestions("#bandwidth");
      cy.contains('[role="menuitem"]', "10 Gbps").click();
      cy.get("#bandwidth").should("have.value", "10 Gbps");

      // encapsulation uses bare strings, so label === value.
      openSuggestions("#encapsulation");
      cy.contains('[role="menuitem"]', "qinq").click();
      cy.get("#encapsulation").should("have.value", "qinq");

      // tags is a multi-value list with {label, value} pairs: selecting a suggestion fills the
      // input with its label, and Enter then commits it as a chip (storing the value "prod").
      cy.get('[aria-label="TextFieldInput-tags"]').find("input").first().click();
      cy.contains('[role="menuitem"]', "Production").click();
      cy.get('[aria-label="TextFieldInput-tags"]').find("input").first().type("{enter}");
      cy.get('[aria-label="TextFieldInput-tags"]').should("contain", "Production");

      // Fill the required identifiers and submit.
      openTabWithField("#name");
      cy.get("#name").type("annotations-showcase");
      cy.get("#service_id").type("0001");
      cy.get('[aria-label="submit"]').should("be.enabled").click();

      // The submitted attributes hold the values, not the shown labels. Cypress only auto-parses a
      // JSON request body when it recognizes the content-type, so parse it ourselves if it is a string.
      cy.wait("@CreateInstance").then(({ request }) => {
        const body = typeof request.body === "string" ? JSON.parse(request.body) : request.body;

        expect(body.attributes.bandwidth).to.equal("10000");
        expect(body.attributes.encapsulation).to.equal("qinq");
        expect(body.attributes.tags).to.deep.equal(["prod"]);
      });
    });

    it("2.5.3 - parameter suggestions, static and templated with ${entity_type}", () => {
      // The popover opens only on focus, and only once suggestions have loaded - it never reopens
      // when they arrive later. So wait for each parameter fetch before focusing, otherwise the
      // field can be focused too early and its popover never opens (proven flaky, issue #7127).
      cy.intercept("GET", "**/parameter/showcase_regions*").as("regionParam");
      cy.intercept("GET", "**/parameter/showcase_templates_*").as("templateParam");

      openAddInstanceForm();

      // region: static parameter name `showcase_regions`, populated in the model.
      openTabWithField("#region");
      cy.wait("@regionParam");
      openSuggestions("#region");
      cy.contains('[role="menuitem"]', "us-east").click();
      cy.get("#region").should("have.value", "us-east");

      // template_name: parameter name `showcase_templates_${entity_type}`, resolved from the form's
      // entity type to `showcase_templates_suggestions-showcase-service` (populated in the model).
      cy.wait("@templateParam");
      openSuggestions("#template_name");
      cy.contains('[role="menuitem"]', "standard.j2").click();
      cy.get("#template_name").should("have.value", "standard.j2");

      cy.get("button").contains("Cancel").click();
    });

    it("2.5.4 - the graphql flavor pulls options from live data", () => {
      // Alias environment_ref's own suggestion query so we can wait for it. The env selector also
      // queries `environments`, but with extra fields (isCompiling); the suggestion query selects
      // only name/id, so match on the absence of isCompiling. Waiting guarantees the options are
      // loaded before we focus - the popover opens only on focus, and only once loaded (issue #7127).
      cy.intercept("POST", "/api/v2/graphql", (req) => {
        const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        const query = typeof body?.query === "string" ? body.query : "";
        if (query.includes("environments") && !query.includes("isCompiling")) {
          req.alias = "EnvRefSuggestions";
        }
      });

      openAddInstanceForm();

      // environment_ref queries the `environments` root and projects name/id into the dropdown.
      // The DOM is identical to the parameter flavor; only the data source differs.
      openTabWithField("#environment_ref");
      cy.wait("@EnvRefSuggestions");
      cy.get("#environment_ref").click();

      cy.contains("h3", "Suggested values").should("be.visible");
      cy.get('[role="menuitem"]').should("have.length.greaterThan", 0);

      cy.get("button").contains("Cancel").click();
    });

    it("2.5.5 - a dependent field waits on its source, stays editable, and refreshes when the source changes", () => {
      openAddInstanceForm();

      // uplink depends on ${form.site}. With site still empty it shows a neutral "waiting" hint and
      // stays editable (never hard-disabled, free typing is always allowed). site and uplink share
      // the Network tab, so both are visible together.
      openTabWithField("#uplink");
      cy.contains("Waiting on site before suggestions become available").should("be.visible");
      cy.get("#uplink").should("not.be.disabled");
      cy.get("#uplink").type("free-text");
      cy.get("#uplink").should("have.value", "free-text");
      cy.get("#uplink").clear();

      // Giving site a value resolves the dependency: the "waiting" hint clears and uplink re-queries.
      openSuggestions("#site");
      cy.contains('[role="menuitem"]', "test").click();
      cy.get("#site").should("have.value", "test");
      cy.contains("Waiting on site before suggestions become available").should("not.exist");

      cy.get("button").contains("Cancel").click();
    });

    it("2.5.6 - broken annotations surface as per-field and form-level errors, without breaking the form", () => {
      openAddInstanceForm();

      // Dependency-graph errors render as a form-level alert at the top, regardless of active tab.
      cy.get('[data-testid="FieldDependencies-Error"]').should("be.visible");
      cy.contains('[data-testid="FieldDependencies-Error"]', "not a field in scope").should(
        "exist"
      );
      cy.contains('[data-testid="FieldDependencies-Error"]', "dependency cycle").should("exist");

      // The per-field annotation errors live on the Errors tab, each on its own control.
      cy.contains('[role="tab"]', "Errors").click();
      cy.contains("Unknown variable(s) in the suggested values parameter name").should(
        "be.visible"
      );
      cy.contains("Unsupported jsonpath in the suggested values projection").should("be.visible");
      cy.contains("Invalid filter field(s) in the suggested values query").should("be.visible");
      cy.contains("The graphql suggested values annotation is malformed").should("be.visible");
      cy.contains("Unsupported jsonpath in a cascading field reference").should("be.visible");

      cy.get("button").contains("Cancel").click();
    });

    it("2.5.7 - unit fields store the API value and offer the annotated unit family", () => {
      openAddInstanceForm();

      // web_unit "B" with web_unit_scales "iec": stored in bytes, only IEC units offered (no metric).
      openTabWithField("#memory_limit");
      cy.get("#memory_limit-helper").should("contain", "= 2147483648 B");
      unitSelect("memory_limit").find('option[value="GiB"]').should("exist");
      unitSelect("memory_limit").find('option[value="GB"]').should("not.exist");

      // web_unit "B" with web_unit_scales "metric": stored in bytes, only metric units offered.
      openTabWithField("#disk_quota");
      cy.get("#disk_quota-helper").should("contain", "= 100000000000 B");
      unitSelect("disk_quota").find('option[value="GB"]').should("exist");
      unitSelect("disk_quota").find('option[value="GiB"]').should("not.exist");

      // web_unit "kbit/s" with web_unit_display "Mbit/s": stored in kbit/s, shown in Mbit/s.
      openTabWithField("#bandwidth_limit");
      cy.get("#bandwidth_limit-helper").should("contain", "= 100000 kbit/s");
      unitSelect("bandwidth_limit").should("have.value", "Mbit/s");

      // web_unit "B/s" with web_unit_scales omitted (defaults to "both"): metric and IEC offered.
      openTabWithField("#transfer_rate");
      cy.get("#transfer_rate-helper").should("contain", "= 125000000 B/s");
      unitSelect("transfer_rate").find('option[value="MB/s"]').should("exist");
      unitSelect("transfer_rate").find('option[value="MiB/s"]').should("exist");

      // web_unit "s": duration ladder, units spelled out (ns..d), scale families do not apply.
      openTabWithField("#session_timeout");
      cy.get("#session_timeout-helper").should("contain", "= 3600 s");
      unitSelect("session_timeout").find('option[value="h"]').should("exist");
      unitSelect("session_timeout").should("contain", "hours");

      // float attribute in a non-base IEC unit (MiB): stored in MiB, IEC-only units offered.
      openTabWithField("#average_throughput");
      cy.get("#average_throughput-helper").should("contain", "= 512 MiB");
      unitSelect("average_throughput").find('option[value="MiB"]').should("exist");
      unitSelect("average_throughput").find('option[value="MB"]').should("not.exist");

      cy.get("button").contains("Cancel").click();
    });
  });
}
