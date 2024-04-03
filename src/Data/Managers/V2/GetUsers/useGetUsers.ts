/**
 * Custom hook to fetch user information from the API.
 * @returns An object containing a custom hook to fetch user information.
 */
import { useQuery } from "@tanstack/react-query";
import { PrimaryBaseUrlManager } from "@/UI";
import { useCreateHeaders } from "../helpers/useCreateHeaders";
import { useHandleErrors } from "../helpers/useHandleErrors";

/**
 * Represents the user information.
 */
export interface UserInfo {
  username: string;
  auth_method: "oidc" | "database";
}

/**
 * Custom hook to fetch user information from the API.
 * @returns An object containing a custom hook to fetch user information.
 */
export const useGetUsers = () => {
  const { handleAuthorization } = useHandleErrors();
  const headers = useCreateHeaders();
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  /**
   * Fetches the user information from the API.
   * @returns A promise that resolves to an object containing the user information.
   * @throws An error if the API request fails.
   */
  const fetchUsers = async (): Promise<{
    data: UserInfo[];
  }> => {
    const response = await fetch(`${baseUrl}/api/v2/user`, {
      headers,
    });
    handleAuthorization(response);
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    return response.json();
  };

  return {
    /**
     * Custom hook to fetch the user information from the API once.
     * @returns The result of the query, including the user information.
     */
    useOneTime: () =>
      useQuery({
        queryKey: ["get_users-one_time"],
        queryFn: fetchUsers,
        retry: false,
        select: (data) => data.data,
      }),
  };
};
