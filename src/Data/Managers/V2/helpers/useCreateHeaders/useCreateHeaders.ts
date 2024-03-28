import { useContext } from "react";
import { DependencyContext } from "@/UI";

/**
 * Retrieves the headers object to be used in API requests.
 *
 * @param env - The environment identifier.
 * @returns The headers object.
 */
export const useCreateHeaders = (env?: string) => {
  const { authController } = useContext(DependencyContext);

  const headers = new Headers();

  if (env) {
    headers.append("X-Inmanta-Tid", env);
  }

  if (authController.isEnabled()) {
    if (!!authController.getToken()) {
      headers.append("Authorization", `Bearer ${authController.getToken()}`);
    }
  }
  return headers;
};
