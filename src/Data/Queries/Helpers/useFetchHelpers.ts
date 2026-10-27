import { useContext } from "react";
import { words } from "@/Core";
import { AuthContext } from "@/Data/Auth";

/**
 * A failed request: the HTTP `status`, and in `details` the `error_details` of the response
 * body when the server sent them.
 */
export interface CustomError extends Error {
  status?: number;
  details?: unknown;
}

/**
 * The HTTP method and path of an API request, without the base url.
 * The path may still hold a query string; error messages leave it out.
 */
export interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
}

const gatewayStatuses = [502, 503, 504];

/**
 * Creates an error that carries the HTTP status of the response it came from, and the `error_details` of its body when given.
 *
 * @example createCustomError("Environment not found", 404) // Error "Environment not found" with status 404
 */
export const createCustomError = (
  message: string,
  status: number,
  details?: unknown
): CustomError => {
  const error: CustomError = new Error(message);

  error.status = status;
  error.details = details;

  return error;
};

/**
 * Gets the `error_details` of a JSON error body, like the attribute validation errors LSM sends.
 * Returns undefined when the body is not JSON or has no details.
 *
 * @example getErrorDetails('{"message":"Invalid","error_details":{"attribute_validation_errors":[]}}') // { attribute_validation_errors: [] }
 */
const getErrorDetails = (bodyText: string): unknown => {
  try {
    return JSON.parse(bodyText)?.error_details;
  } catch {
    return undefined;
  }
};

/**
 * Gets the message of a JSON error body: the REST `message` field, or else the first GraphQL error, which the orchestrator wraps in `data`.
 * Returns undefined when the body is not JSON or has no message, like the HTML error page of a proxy.
 *
 * @example getServerMessage('{"data":{"data":null,"errors":["Syntax Error: Expected Name, found <EOF>."]}}') // "Syntax Error: Expected Name, found <EOF>."
 */
const getServerMessage = (bodyText: string): string | undefined => {
  try {
    const body = JSON.parse(bodyText);
    const firstGraphQLError = body?.data?.errors?.[0];

    if (typeof body?.message === "string" && body.message !== "") {
      return body.message;
    }

    return typeof firstGraphQLError === "string" && firstGraphQLError !== ""
      ? firstGraphQLError
      : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Formats the message for a response that doesn't explain itself, based on its status.
 * Gateway statuses come from a proxy in front of the orchestrator.
 *
 * @example formatStatusMessage(502) // "The server can't be reached (status 502)."
 */
const formatStatusMessage = (status: number): string =>
  gatewayStatuses.includes(status)
    ? words("error.response.unreachable")(status)
    : words("error.response.unexpected")(status);

/**
 * Formats the message for a successful response whose body is not JSON.
 * A redirected response is most likely a proxy's login page after its session expired.
 *
 * @example formatNonJsonResponseMessage(redirectedResponse) // "Your session may have expired. Reload the page to sign in again."
 */
const formatNonJsonResponseMessage = (response: Response): string =>
  response.redirected
    ? words("error.response.redirected")
    : words("error.response.unexpected")(response.status);

/**
 * Reads the body of a successful response as JSON of the given type, or undefined when the body is empty.
 * Throws a CustomError when the body is not JSON, like a proxy's login page sent with status 200.
 *
 * @example await parseJsonResponse<{ data: string[] }>(new Response('{"data":[]}')) // { data: [] }
 */
export const parseJsonResponse = async <ResponseBody = unknown>(
  response: Response
): Promise<ResponseBody | undefined> => {
  const bodyText = await response.text();

  if (!bodyText) {
    return undefined;
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    throw createCustomError(formatNonJsonResponseMessage(response), response.status);
  }
};

/**
 * Gets the parsed response body of a request that always answers with data.
 * Throws an error when the server sent an empty body instead.
 *
 * @example getRequiredResponseBody({ data: [] }) // { data: [] }
 */
export const getRequiredResponseBody = <ResponseBody>(
  responseBody: ResponseBody | undefined
): ResponseBody => {
  if (responseBody === undefined) {
    throw new Error(words("error.response.empty"));
  }

  return responseBody;
};

/**
 * React Query hook that provides HTTP helper functions.
 *
 * @returns An object containing the HTTP helper functions.
 */
export const useFetchHelpers = () => {
  const authHelper = useContext(AuthContext);

  /**
   * Throws a CustomError for a failed response and starts the login flow on a 401.
   * Uses the server's message when the body has one, otherwise a message based on the status. Every 403 message ends with the endpoint, so the denied call can be found in the access policy: an access policy denial and a business rule 403 can only be told apart by core's message text, which isn't a stable contract.
   *
   * @example
   * await handleErrors(forbiddenResponse, { method: "POST", path: "/api/v2/graphql" })
   * // throws "Request is not allowed by the access policy. (POST /api/v2/graphql)" with status 403
   */
  async function handleErrors(response: Response, endpoint: ApiEndpoint) {
    if (response.status === 401) {
      authHelper.login();
    }

    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      const message = getServerMessage(bodyText) ?? formatStatusMessage(response.status);
      const details = getErrorDetails(bodyText);

      if (response.status === 403) {
        const [pathWithoutQuery] = endpoint.path.split("?");

        throw createCustomError(
          words("error.response.endpoint")(message, endpoint.method, pathWithoutQuery),
          response.status,
          details
        );
      }

      throw createCustomError(message, response.status, details);
    }
  }

  /**
   * Retrieves the headers object to be used in API requests.
   *
   * @param env - The environment identifier.
   * @returns The headers object.
   */
  function createHeaders(options?: { env?: string; message?: string }) {
    const { env, message } = options || {};
    const headers = new Headers();

    if (env) {
      headers.append("X-Inmanta-Tid", env);
    }

    if (!!authHelper.getToken()) {
      headers.append("Authorization", `Bearer ${authHelper.getToken()}`);
    }

    if (message) {
      headers.append("message", message);
    }

    return headers;
  }

  return {
    handleErrors,
    createHeaders,
  };
};
