/**
 * Returns the default environment display name for the current edition.
 */
const getDefaultEnvName = () =>
  Cypress.expose("edition") === "iso" ? "test (lsm-frontend)" : "test (oss-frontend)";

/**
 * Selects an environment from the header dropdown.
 * Assumes a page with the header is already loaded.
 * Defaults to the edition-appropriate test environment when no name is given.
 *
 * @param {string} [nameEnvironment] - partial or full display name of the environment
 */
const selectEnvironment = (nameEnvironment) => {
  const resolvedName = nameEnvironment ?? getDefaultEnvName();
  cy.get('[data-testid="env-selector-toggle"]').click();
  cy.get('[role="menuitem"]').contains(resolvedName).click();
};

/**
 * Yields the id of the environment with the given display name, which is how the environment
 * selector shows it: `<environment name> (<project name>)`. Fails when no environment has that name.
 *
 * @example getEnvironmentId("test (lsm-frontend)") yields "60d7245a-f842-4af2-b296-3198c35d2b4d"
 */
const getEnvironmentId = (nameEnvironment) =>
  cy.request("/api/v2/project").then((response) => {
    for (const project of response.body.data) {
      const environment = project.environments.find(
        (item) => `${item.name} (${project.name})` === nameEnvironment
      );

      if (environment) {
        return environment.id;
      }
    }

    throw new Error(`No environment with display name "${nameEnvironment}"`);
  });

/**
 * Decommissions the environment with the given display name, which removes its resources and
 * service instances. Defaults to the edition-appropriate test environment.
 *
 * @example clearEnvironment("test (lsm-frontend)")
 */
const clearEnvironment = (nameEnvironment = getDefaultEnvName()) => {
  getEnvironmentId(nameEnvironment).then((id) => {
    cy.request("DELETE", `/api/v1/decommission/${id}`);
  });
};

/**
 * Checks, from the newest compile reports of an environment, whether a service catalog update has
 * finished. A successful catalog update compile is followed by a compile that exports the
 * resources, so the update only finishes once that second compile has completed too.
 *
 * @example isServiceCatalogUpdateFinished([{ remote_id: "634b1a07", completed: "2026-10-21T14:04:32", success: false }], "634b1a07") returns true
 */
const isServiceCatalogUpdateFinished = (compileReports, catalogUpdateRemoteId) => {
  const catalogUpdateCompile = compileReports.find(
    (report) => report.remote_id === catalogUpdateRemoteId
  );
  const newestCompile = compileReports[0];

  if (!catalogUpdateCompile || !newestCompile.completed) {
    return false;
  }

  if (newestCompile === catalogUpdateCompile) {
    return !catalogUpdateCompile.success;
  }

  return true;
};

const SERVICE_CATALOG_UPDATE_MAX_POLLS = 180;

/**
 * Polls the compile reports of an environment about once a second until the service catalog
 * update started by `export_service_definition` has finished, and fails after
 * `SERVICE_CATALOG_UPDATE_MAX_POLLS` polls (about 3 minutes). `catalogUpdateRemoteId` is the
 * value that endpoint returns: the `remote_id` of the compile it requests, not the compile's own `id`.
 *
 * @example waitForServiceCatalogUpdate("60d7245a-f842-4af2-b296-3198c35d2b4d", "634b1a07-69c7-45e5-b797-2dd78a929625")
 */
const waitForServiceCatalogUpdate = (
  environmentId,
  catalogUpdateRemoteId,
  remainingPolls = SERVICE_CATALOG_UPDATE_MAX_POLLS
) => {
  cy.request({
    url: "/api/v2/compilereport?limit=10&sort=requested.desc",
    headers: { "X-Inmanta-Tid": environmentId },
  }).then((response) => {
    if (isServiceCatalogUpdateFinished(response.body.data, catalogUpdateRemoteId)) {
      return;
    }

    if (remainingPolls <= 1) {
      throw new Error(
        `Service catalog update in environment ${environmentId} did not finish after ${SERVICE_CATALOG_UPDATE_MAX_POLLS} polls, waiting for the compile with remote id ${catalogUpdateRemoteId} and the compile that follows it`
      );
    }

    cy.wait(1000);
    waitForServiceCatalogUpdate(environmentId, catalogUpdateRemoteId, remainingPolls - 1);
  });
};

/**
 * Updates the project of the environment with the given display name, exports its service
 * catalog and waits until the resulting compiles have finished. Part of the cleanup cycle that
 * runs before a scenario. Defaults to the edition-appropriate test environment.
 *
 * @example forceUpdateEnvironment("test (lsm-frontend)")
 */
const forceUpdateEnvironment = (nameEnvironment = getDefaultEnvName()) => {
  getEnvironmentId(nameEnvironment).then((id) => {
    cy.request({
      method: "POST",
      url: "/lsm/v1/exporter/export_service_definition",
      headers: { "X-Inmanta-Tid": id },
      body: { force_update: true },
    }).then((response) => {
      waitForServiceCatalogUpdate(id, response.body.data);
    });
  });
};

export default {
  getDefaultEnvName,
  selectEnvironment,
  clearEnvironment,
  waitForServiceCatalogUpdate,
  forceUpdateEnvironment,
};
