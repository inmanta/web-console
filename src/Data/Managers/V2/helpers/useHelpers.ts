import { useContext } from "react";
import { DependencyContext } from "@/UI";

export const useHelpers = () => {
  const { authHelper } = useContext(DependencyContext);

  async function handleErrors(response: Response, customErrorMessage?: string) {
    if (response.status === 401 || response.status === 403) {
      authHelper.login();
    }

    if (!response.ok) {
      throw new Error(
        customErrorMessage || JSON.parse(await response.text()).message,
      );
    }
  }

  /**
   * Retrieves the headers object to be used in API requests.
   *
   * @param env - The environment identifier.
   * @returns The headers object.
   */
  function createHeaders(env?: string) {
    const headers = new Headers();

    if (env) {
      headers.append("X-Inmanta-Tid", env);
    }

    if (!!authHelper.getToken()) {
      headers.append("Authorization", `Bearer ${authHelper.getToken()}`);
    }
    return headers;
  }

  return {
    handleErrors,
    createHeaders,
  };
};
