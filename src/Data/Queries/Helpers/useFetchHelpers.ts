import { useContext } from "react";
import { AuthContext } from "@/Data/Auth";

export interface CustomError extends Error {
  status?: number;
}

/**
 * React Query hook that provides HTTP helper functions.
 *
 * @returns An object containing the HTTP helper functions.
 */
export const useFetchHelpers = () => {
  const authHelper = useContext(AuthContext);

  /**
   * Handles errors returned from API responses.
   *
   * @param response - The API response object.
   * @param customErrorMessage - Optional custom error message.
   * @throws An error with the error message from the API response.
   */
  async function handleErrors(response: Response, customErrorMessage?: string) {
    if (response.status === 401) {
      authHelper.login();
    }

    if (!response.ok) {
      let message = customErrorMessage;
      let bodyText: string | undefined;
      try {
        bodyText = await response.text();
        try {
          const data = JSON.parse(bodyText);
          if (data && data.message) message = data.message;
        } catch {
          // If not JSON, use the text as message
          if (bodyText && !message) message = bodyText;
        }
      } catch {
        // ignore body read errors
      }
      if (!message) message = response.statusText || "An unknown error occurred";
      const error: CustomError = new Error(message);
      error.status = response.status;
      throw error;
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
