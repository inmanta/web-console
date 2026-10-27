/**
 * The English messages of the web-console core layer.
 */
export const coreMessages = {
  /**
   * General text
   */
  noData: "There is no data available to display.",

  /**
   * Error related text
   */
  "error.authentication": (message: string) => `Authentication error: ${message}`,
  "error.response.unreachable": (status: number) =>
    `The server can't be reached (status ${status}).`,
  "error.response.unexpected": (status: number) =>
    `The server sent an unexpected response (status ${status}).`,
  "error.response.empty": "The server sent an empty response.",
  "error.response.redirected": "Your session may have expired. Reload the page to sign in again.",
  "error.response.endpoint": (message: string, method: string, path: string) =>
    `${message} (${method} ${path})`,

  /**
   * Inventory related text
   */
  "inventory.form.suggestions.unknownVariable": (variables: string, supported: string) =>
    `Unknown variable(s) in the suggested values parameter name: ${variables}. Supported variables: ${supported}.`,
  "inventory.form.suggestions.unsupportedPath": (paths: string) =>
    `Unsupported jsonpath in the suggested values projection: ${paths}. Only navigational paths (member access, array index, equality-filter selection) are supported.`,
  "inventory.form.suggestions.invalidFilterKey": (keys: string) =>
    `Invalid filter field(s) in the suggested values query: ${keys}. A filter key must be a plain GraphQL field name; nested fields are expressed as nested objects, not dotted paths.`,
  "inventory.form.suggestions.invalidQuery":
    "The graphql suggested values annotation is malformed. It requires a 'query' with a 'root' and a 'value' projection.",
  "inventory.form.suggestions.unsupportedFieldPath": (paths: string) =>
    `Unsupported jsonpath in a cascading field reference: ${paths}. Only navigational paths (member access, array index, equality-filter selection) are supported.`,

  /**
   * Login
   */
  "login.title": "Log in to your account",
  "login.fallback.description":
    "The identity provider could not sign you in. You can retry, or use a local account.",
  "login.fallback.idp": "Sign in with your identity provider",
  "login.fallback.local": "Sign in with a local account",
};

type CoreMessages = typeof coreMessages;

declare module "@/Core/I18n/Words" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface WordsRegistry extends CoreMessages {}
}
