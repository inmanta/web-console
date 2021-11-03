export default {
  /**
   * Error related text
   */
  error: "Something went wrong",
  "error.environment.missing": "Environment is missing",
  "error.server.intro": (errorMessage: string) =>
    `The following error occured while communicating with the server: ${errorMessage}`,
  "error.authorizationFailed": "Authorization failed, please log in",
  "error.fetch": (error: string) =>
    `There was an error retrieving data: ${error}`,
  "error.notFound.title": "404: We couldn't find that page",
  "error.notFound.home": "Go home",
};
