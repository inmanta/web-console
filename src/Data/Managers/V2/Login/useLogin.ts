import { useMutation } from "@tanstack/react-query";
import { PrimaryBaseUrlManager } from "@/UI";
import { useHandleErrors } from "../helpers/useHandleErrors";

/**
 * Custom hook for performing user login mutation for database authentication - for keycloak head to keycloak.js library.
 * This hook utilizes React Query's useMutation to handle asynchronous mutations.
 * @returns A tuple containing the mutation function and mutation state.
 */
export const useLogin = () => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const { handleAuthorization } = useHandleErrors();
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  /**
   * Asynchronously posts login credentials to the server and retrieves the response.
   * @param {Object} orderBody - Object containing username and password.
   * @param {string} orderBody.username - User's username.
   * @param {string} orderBody.password - User's password.
   * @returns {Promise<Object>} A promise resolving to an object containing token and user information.
   * @throws {Error} If the response from the server is not successful, an error is thrown with the error message.
   */
  const postOrder = async (orderBody: {
    username: string;
    password: string;
  }): Promise<{
    data: {
      token: string;
      user: {
        username: string;
        auth_method: string;
      };
    };
  }> => {
    const response = await fetch(baseUrl + "/api/v2/login", {
      method: "POST",
      body: JSON.stringify(orderBody),
      headers: {
        "Content-Type": "application/json",
      },
    });
    handleAuthorization(response);

    if (!response.ok) {
      throw new Error(JSON.parse(await response.text()).message);
    }

    return response.json();
  };

  return useMutation({ mutationFn: postOrder, mutationKey: ["login"] });
};
