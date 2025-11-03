import { useQuery } from "@tanstack/react-query";
import { useGetWithoutEnv } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";

/**
 * React Query hook to fetch the roles for a given environment.
 * @param environmentId - The ID of the environment to fetch the roles for.
 * @returns An object containing a custom hook to fetch the roles for a given environment.
 */
export const useGetRoles = (environmentId: string) => {
  const get = useGetWithoutEnv()<{ data: string[] }>;

  return {
    useOneTime: () =>
      useQuery({
        queryKey: getRolesKey.list([environmentId]),
        queryFn: () => get("/api/v2/role"),
        select: (data) => data.data,
      }),
  };
};

export const getRolesKey = new KeyFactory(SliceKeys.auth, "get_roles");
