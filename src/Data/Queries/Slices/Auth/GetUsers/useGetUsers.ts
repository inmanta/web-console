/**
 * React Query hook to fetch user information from the API.
 * @returns An object containing a custom hook to fetch user information.
 */
import { useQuery } from "@tanstack/react-query";
import { useGetWithoutEnv } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";

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
  const get = useGetWithoutEnv()<{ data: UserInfo[] }>;

  return {
    /**
     * Custom hook to fetch the user information from the API once.
     * @returns The result of the query, including the user information.
     */
    useOneTime: () =>
      useQuery({
        queryKey: getUserKey.list(),
        queryFn: () => get("/api/v2/user"),
        select: (data) => data.data,
      }),
  };
};

export const getUserKey = new KeyFactory(SliceKeys.auth, "get_user");
