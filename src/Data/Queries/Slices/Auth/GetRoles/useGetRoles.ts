/**
 * React Query hook to fetch roles for the users from the API.
 * @returns An object containing a custom hook to fetch roles for the users.
 */
import { useQuery } from "@tanstack/react-query";
import { useGetWithoutEnv } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";

/**
 * Custom hook to fetch roles for the users from the API.
 * @returns An object containing a custom hook to fetch roles for the users.
 */
export const useGetRoles = () => {
  const get = useGetWithoutEnv()<{ data: string[] }>;

  return {
    /**
     * Custom hook to fetch the roles for the users from the API once.
     * @returns The result of the query, including the roles for the users.
     */
    useOneTime: () =>
      useQuery({
        queryKey: getRolesKey.list(),
        queryFn: () => get("/api/v2/role"),
        select: (data) => data.data,
      }),
  };
};

export const getRolesKey = new KeyFactory(SliceKeys.auth, "get_role");
