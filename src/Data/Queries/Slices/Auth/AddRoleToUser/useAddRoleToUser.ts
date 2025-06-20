import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { usePostWithoutEnv } from "@/Data/Queries";
import { UserRole } from "../GetUserRoles/useGetUserRoles";

/**
 * Custom hook for adding a role to a user.
 * @param {string} user - The username of the user to add the role to.
 * @returns {Mutation<void, Error, UserRole>} - The mutation function.
 */
export const useAddRoleToUser = ({
  user,
  options,
}: {
  user: string;
  options?: UseMutationOptions<void, Error, UserRole>;
}) => {
  //until core won't align endpoints we need to do conversion at this point
  const post = usePostWithoutEnv()<{
    role: string;
    environment: string;
  }>;

  return useMutation<void, Error, UserRole>({
    mutationFn: (body) => post(`/api/v2/role_assignment/${user}`, body),
    mutationKey: ["add_role_to_user", user],
    ...options,
  });
};
