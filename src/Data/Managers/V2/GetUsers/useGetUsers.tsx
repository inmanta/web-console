import { useQuery } from "@tanstack/react-query";
import { PrimaryBaseUrlManager } from "@/UI";
import { useCreateHeaders } from "../helpers/useCreateHeaders";

export interface UserInfo {
  username: string;
  auth_method: "oidc" | "database";
}

export const useGetUsers = () => {
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
