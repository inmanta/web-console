import { useQuery } from "@tanstack/react-query";
import { PrimaryBaseUrlManager } from "@/UI";
import { useCreateHeaders } from "../helpers/useCreateHeaders";
import { useHandleErrors } from "../helpers/useHandleErrors";

export interface UserInfo {
  username: string;
  auth_method: "oidc" | "database";
}

export const useGetUsers = () => {
  const { handleAuthorization } = useHandleErrors();
  const headers = useCreateHeaders();
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  const fetchUsers = async (): Promise<{
    data: UserInfo[];
  }> => {
    const response = await fetch(`${baseUrl}/api/v2/user`, {
      headers,
    });
    handleAuthorization(response);
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    return response.json();
  };

  return {
    /**
     * Custom hook to fetch the parameter from the API once.
     * @returns The result of the query, including the parameter data.
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
