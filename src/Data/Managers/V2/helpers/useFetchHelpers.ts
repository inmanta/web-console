import { useContext } from "react";
import { DependencyContext } from "@/UI";

export interface CustomError extends Error {
  status?: number;
}

/**
 * React Query hook that provides HTTP helper functions.
 *
 * @returns An object containing the HTTP helper functions.
 */
export const useFetchHelpers = () => {
  const { authHelper } = useContext(DependencyContext);

  /**
   * Handles errors returned from API responses.
   *
   * @param response - The API response object.
   * @param customErrorMessage - Optional custom error message.
   * @throws An error with the error message from the API response.
   */
  async function handleErrors(response: Response, customErrorMessage?: string) {
    if (response.status === 401 || response.status === 403) {
      authHelper.login();
    }

    if (!response.ok) {
      const error: CustomError = new Error(
        customErrorMessage || JSON.parse(await response.text()).message
      );

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
