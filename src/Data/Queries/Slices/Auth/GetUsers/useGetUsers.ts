/**
 * React Query hook to fetch user information from the API.
 * @returns An object containing a custom hook to fetch user information.
 */
import { useQuery } from "@tanstack/react-query";
import { useGetWithoutEnv, KeyFactory, keySlices } from "@/Data/Queries";

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
  const keyFactory = new KeyFactory(keySlices.auth, "get_user");

  return {
    /**
     * Custom hook to fetch the user information from the API once.
     * @returns The result of the query, including the user information.
     */
    useOneTime: () =>
      useQuery({
        queryKey: keyFactory.list(),
        queryFn: () => get("/api/v2/user"),
        select: (data) => data.data,
      }),
  };
};
