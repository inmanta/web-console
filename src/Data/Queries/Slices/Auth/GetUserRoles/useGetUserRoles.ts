import { useQuery } from "@tanstack/react-query";
import { useGetWithoutEnv } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";

export interface UserRole {
  role: string;
  environment: string;
}

/**
 * Custom hook to fetch user role information from the API.
 * @returns An object containing a custom hook to fetch user role information.
 */
export const useGetUserRoles = () => {
  const get = useGetWithoutEnv()<{ data: UserRole[] }>;

  return {
    useOneTime: (username: string) =>
      useQuery({
        queryKey: getUserRoleKey.single(username),
        queryFn: () => get(`/api/v2/role_assignment/${username}`),
        select: (data) => data.data,
      }),
  };
};

export const getUserRoleKey = new KeyFactory(SliceKeys.auth, "get_user_role");
