/**
 * Custom hook that handles errors.
 * @returns An object containing the `handleAuthorization` function.
 */
import { useContext } from "react";
import { DependencyContext } from "@/UI";

export const useHandleErrors = () => {
  const { useAuth } = useContext(DependencyContext);

  /**
   * Handles authorization-related errors in the response.
   * @param response - The response object received from the API.
   */
  const handleAuthorization = (response: Response) => {
    if (response.status === 401) {
      useAuth.login();
    }
  };

  return { handleAuthorization };
};
