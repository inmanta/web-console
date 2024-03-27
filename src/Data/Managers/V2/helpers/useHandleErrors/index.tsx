import { useContext } from "react";
import { DependencyContext } from "@/UI";

export const useHandleErrors = () => {
  const { authController } = useContext(DependencyContext);
  const handleAuthorization = (response: Response) => {
    if (authController.isEnabled() && authController.shouldAuthLocally()) {
      if (response.status === 401) {
        document.dispatchEvent(new CustomEvent("open-login"));
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
