import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useDeleteWithoutEnv } from "@/Data/Queries";
import { UserRole } from "../GetUserRoles/useGetUserRoles";

interface Props {
  user: string;
  options?: UseMutationOptions<void, Error, UserRole>;
}

/**
 * Custom hook for removing a role to a user.
 * @param {string} user - The username of the user to remove the role from.
 * @returns {Mutation<void, Error>} - The mutation function.
 */
export const useRemoveRoleFromUser = ({ user, options }: Props) => {
  const deleteRole = useDeleteWithoutEnv();

  return useMutation<void, Error, UserRole>({
    mutationFn: ({ role, environment }) =>
      deleteRole(`/api/v2/role_assignment/${user}?role=${role}&environment=${environment}`),
    mutationKey: ["delete_role_from_user", user],
    ...options,
  });
};
