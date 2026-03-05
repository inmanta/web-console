/**
 * Shorthand method to clear the environment being passed.
 * By default, if no arguments are passed it will target the 'test' environment.
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
 * Based on the environment id, recursively check if a compile is pending.
 * It will continue the recursion as long as the statusCode is equal to 200.
 *
 * @param {string} id
 */
const checkStatusCompile = (id) => {
  let statusCodeCompile = 200;

  if (statusCodeCompile === 200) {
    cy.intercept("/api/v2/graphql").as("IsCompiling");
    // The timeout is necessary to avoid errors.
    // Cypress doesn't support while loops and this was the only workaround to wait
    // till the status code is not 200 anymore.
    cy.wait("@IsCompiling").then((req) => {
      statusCodeCompile = req.response.statusCode;
      const environments = req.response.body.data.data.environments;

      if (environments) {
        const edges = environments.edges;

        if (edges && edges.length > 0) {
          const environment = edges.find((env) => env.node.id === id);

          if (environment && !environment.node.isCompiling) {
            return;
          }
        }
      }

      checkStatusCompile(id);
    });
  }
};

/**
 * Execute a force update on the target environment (default: 'test').
 * This can be executed standalone, but is part of the cleanup cycle that is
 * needed before running a scenario.
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
      url: "/lsm/v1/exporter/export_service_definition",
      headers: { "X-Inmanta-Tid": id },
      body: { force_update: true },
    });
    checkStatusCompile(id);
  });
};

module.exports = {
  clearEnvironment,
  checkStatusCompile,
  forceUpdateEnvironment,
};
