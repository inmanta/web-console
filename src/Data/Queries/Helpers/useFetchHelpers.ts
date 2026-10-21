import { useContext } from "react";
import { AuthContext } from "@/Data/Auth";
import { words } from "@/UI/words";

export interface CustomError extends Error {
  status?: number;
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
 * Creates an error that carries the HTTP status of the response it came from.
 *
 * @example createCustomError("Environment not found", 404) // Error "Environment not found" with status 404
 */
const createCustomError = (message: string, status: number): CustomError => {
  const error: CustomError = new Error(message);

  error.status = status;

  return error;
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

    if (typeof body?.message === "string") {
      return body.message;
    }

    return typeof firstGraphQLError === "string" ? firstGraphQLError : undefined;
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
 * Reads the body of a successful response as JSON, or undefined when the body is empty.
 * Throws a CustomError when the body is not JSON, like a proxy's login page sent with status 200.
 *
 * @example await parseJsonResponse(new Response('{"data":[]}')) // { data: [] }
 */
export const parseJsonResponse = async (response: Response) => {
  const bodyText = await response.text();

  if (!bodyText) {
    return undefined;
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    throw createCustomError(formatStatusMessage(response.status), response.status);
  }
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
   * Uses the server's message when the body has one, otherwise a message based on the status, and adds the endpoint to the server's message on a 403 so the denied call can be found in the access policy.
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
      const serverMessage = getServerMessage(bodyText);

      if (serverMessage === undefined) {
        throw createCustomError(formatStatusMessage(response.status), response.status);
      }

      if (response.status === 403) {
        const [pathWithoutQuery] = endpoint.path.split("?");

        throw createCustomError(
          words("error.response.endpoint")(serverMessage, endpoint.method, pathWithoutQuery),
          response.status
        );
      }

      throw createCustomError(serverMessage, response.status);
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
