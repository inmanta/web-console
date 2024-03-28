/**
 * Custom hook that handles errors.
 * @returns An object containing the `handleAuthorization` function.
 */
import { useContext } from "react";
import { DependencyContext } from "@/UI";

export const useHandleErrors = () => {
  const { authController } = useContext(DependencyContext);

  /**
   * Throws an error indicating that access to a resource is unauthorized.
   */
  const throwUnauthorizedError = () => {
    throw new Error("Access to this resource is unauthorized");
  };

  /**
   * Handles authorization-related errors in the response.
   * If the user is authenticated locally, it dispatches an event to open the login page and throws an unauthorized error.
   * If the user is authenticated with Keycloak, it clears the token if the response status is 401 (Unauthorized),
   * and logs in again if the token is expired.
   * @param response - The response object received from the API.
   */
  const handleAuthorization = (response: Response) => {
    if (authController.isEnabled() && authController.shouldAuthLocally()) {
      if (response.status === 401) {
        document.dispatchEvent(new CustomEvent("open-login"));
        throwUnauthorizedError();
      }
    } else if (authController.isEnabled()) {
      const keycloakInstance = authController.getInstance();
      if (response.status === 401) {
        keycloakInstance.clearToken();
      }

      if (keycloakInstance.isTokenExpired()) {
        keycloakInstance.login();
      }
    }
  };

  return { handleAuthorization };
};
