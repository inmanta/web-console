/**
 * The composer's ship modes (see "Features loaded at runtime" in docs/notes.md). Each block puts
 * the web console under test in a mode with the `setComposerShipMode` task
 * (cypress.config.ship-modes.cjs), then checks what users get:
 * - combined: the composer's actions and its read-only view;
 * - without: no composer action, link or page, and no link to a missing page;
 * - installed later: the composer's actions and pages once its files are copied next to the
 *   running web console and the page is loaded again;
 * - version mismatch: no composer, and a notice that its version doesn't match.
 *
 * It ends in the "combined" mode, as the web console is built. After an aborted run, restore it
 * with `yarn composer-ship-mode combined --container inmanta_orchestrator` (or `--dir`).
 */
import environmentHelpers from "../../support/environmentHelpers.js";

const { clearEnvironment, forceUpdateEnvironment, getDefaultEnvName, getEnvironmentId } =
  environmentHelpers;

const SERVICE = "basic-service";
const NOT_FOUND = "404: We couldn't find that page";

let environmentId;
let instanceId;

/**
 * Opens the web console and goes to the inventory of the service, which has one instance.
 *
 * It opens the web console at its root rather than at the inventory's url: the import map points
 * at the composer's entry with a relative url, which the orchestrator serves from every path, but
 * `vite preview` doesn't.
 */
const visitInventory = () => {
  cy.visit(`/console/?env=${environmentId}`);
  cy.get('[aria-label="Sidebar-Navigation-Item"]').contains("Service Catalog").click();
  cy.get(`#${SERVICE}`).contains("Inventory").click();
  cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);
};

/**
 * Puts the web console in a ship mode, and clears the browser's cache. The orchestrator keeps the
 * ETag of a file it has served when the file is replaced, so the browser would otherwise keep
 * using the composer files of the previous mode.
 *
 * @param {"without" | "combined" | "mismatch"} mode - the ship mode
 */
const setShipMode = (mode) =>
  cy
    .task("setComposerShipMode", mode)
    .then(() =>
      Cypress.automation("remote:debugger:protocol", { command: "Network.clearBrowserCache" })
    );

/**
 * Opens the actions menu of the instance's row in the inventory.
 */
const openRowActions = () => {
  cy.get('[aria-label="row actions toggle"]').click();
  cy.get('[role="menu"]').should("be.visible");
};

/**
 * Goes from the inventory to the details page of the instance, and opens its actions menu.
 */
const openInstanceActions = () => {
  cy.get('[aria-label="instance-details-link"]').first().click();
  cy.get('[aria-label="Instance-Details-Success"]').should("be.visible");
  cy.get('[aria-label="Actions-Toggle"]').click();
  cy.get('[role="menu"]').should("be.visible");
};

/**
 * Checks that the composer's actions are on the instance details page and the inventory, and
 * that its read-only view opens with the instance. Editing may be disabled while the new instance
 * deploys, so this doesn't open the editor.
 */
const assertComposer = () => {
  visitInventory();
  // The pages show once the composer has loaded, so a notice would be on screen by now.
  cy.get('[data-testid="version-mismatch-composer"]').should("not.exist");
  cy.get('[aria-label="AddInstanceToggle"]').click();
  cy.get("#add-instance-composer-button").should("be.visible");
  cy.get('[aria-label="AddInstanceToggle"]').click();

  openInstanceActions();
  cy.get('[role="menu"]').contains("Edit in Composer").should("be.visible");
  cy.go("back");
  cy.get('[aria-label="InstanceRow-Intro"]').should("have.length", 1);

  openRowActions();
  cy.get('[role="menu"]').contains("Edit in Composer").should("be.visible");
  cy.get('[role="menu"]').contains("Show in Composer").click();
  cy.get(`g[data-type="app.ServiceEntityShape"] [data-testid="header-${SERVICE}"]`, {
    timeout: 30000,
  }).should("be.visible");
  cy.contains(NOT_FOUND).should("not.exist");
};

/**
 * Checks that nothing of the composer is left: no action or link on the inventory and the
 * instance details page, and its pages are not found.
 */
const assertNoComposer = () => {
  visitInventory();
  cy.get('[aria-label="AddInstanceToggle"]').should("not.exist");
  cy.get("#add-instance-button").should("be.visible");

  openRowActions();
  cy.get('[role="menu"]').should("not.contain", "Composer");
  cy.get('a[href*="/composer"]').should("not.exist");
  cy.get('[aria-label="row actions toggle"]').click();

  openInstanceActions();
  cy.get('[role="menu"]').should("not.contain", "Composer");
  cy.get('a[href*="/composer"]').should("not.exist");

  [
    `/console/lsm/catalog/${SERVICE}/inventory/composer?env=${environmentId}`,
    `/console/lsm/catalog/${SERVICE}/inventory/${instanceId}/composer?env=${environmentId}`,
    `/console/lsm/catalog/${SERVICE}/inventory/${instanceId}/composer-viewer?env=${environmentId}`,
  ].forEach((url) => {
    cy.visit(url);
    cy.contains(NOT_FOUND).should("be.visible");
  });
};

/**
 * Adds the links to pages of the web console that are on the page to `links`, except disabled
 * ones.
 *
 * @param {Set<string>} links - the set the links are added to
 */
const collectLinks = (links) =>
  cy.get('a[href^="/console/"]').each(($link) => {
    if ($link.attr("aria-disabled") !== "true") {
      links.add($link.attr("href"));
    }
  });

describe("Composer ship modes", () => {
  before(() => {
    clearEnvironment();
    forceUpdateEnvironment();

    getEnvironmentId(getDefaultEnvName()).then((id) => {
      environmentId = id;

      cy.request({
        method: "POST",
        url: `/lsm/v1/service_inventory/${SERVICE}`,
        headers: { "X-Inmanta-Tid": id },
        body: {
          attributes: {
            name: "ship-modes",
            service_id: "0001",
            ip_r1: "1.2.3.4",
            interface_r1_name: "eth0",
            address_r1: "1.2.3.5/32",
            vlan_id_r1: 1,
            ip_r2: "1.2.2.1",
            interface_r2_name: "interface-vlan",
            address_r2: "1.2.2.3/32",
            vlan_id_r2: 2,
          },
        },
      }).then((response) => {
        instanceId = response.body.data.id;
      });
    });
  });

  after(() => {
    setShipMode("combined");
  });

  describe("Combined", () => {
    before(() => {
      setShipMode("combined");
    });

    it("has the composer's actions and pages", () => {
      assertComposer();
    });
  });

  describe("Without the composer", () => {
    before(() => {
      setShipMode("without");
    });

    it("has no composer action, link or page", () => {
      assertNoComposer();
    });

    it("has no link to a missing page", () => {
      const links = new Set();

      visitInventory();
      collectLinks(links);
      openRowActions();
      collectLinks(links);
      cy.get('[aria-label="row actions toggle"]').click();
      openInstanceActions();
      collectLinks(links);

      cy.wrap(links).then(() => {
        // The sidebar's pages, the service's and the instance's.
        expect(links.size).to.be.greaterThan(10);

        links.forEach((link) => {
          cy.visit(link);
          cy.get('[aria-label="Sidebar-Navigation-Item"]').should("have.length.greaterThan", 1);
          cy.contains(NOT_FOUND).should("not.exist");
        });
      });
    });
  });

  describe("Installed later", () => {
    before(() => {
      setShipMode("without");
    });

    it("adds the composer once its files are copied in and the page is loaded again", () => {
      visitInventory();
      cy.get('[aria-label="AddInstanceToggle"]').should("not.exist");

      // Install the composer of the same version next to the running web console.
      setShipMode("combined");

      assertComposer();
    });
  });

  describe("Version mismatch", () => {
    before(() => {
      setShipMode("mismatch");
    });

    it("leaves the composer out with a notice", () => {
      cy.visit(`/console/?env=${environmentId}`);
      cy.get('[data-testid="version-mismatch-composer"]')
        .should("be.visible")
        .and("contain", "composer version mismatch")
        .and("contain", "The composer is version 0.0.0-mismatch");

      assertNoComposer();
    });
  });
});
