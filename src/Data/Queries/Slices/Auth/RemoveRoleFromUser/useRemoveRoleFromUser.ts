import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useDeleteWithoutEnv } from "@/Data/Queries";

/**
 * Custom hook for removing a role to a user.
 * @param {string} user - The username of the user to remove the role from.
 * @returns {Mutation<void, Error>} - The mutation function.
 */
export const useRemoveRoleFromUser = ({user, options}: {user: string, options?: UseMutationOptions<void, Error>}) => {
  const deleteRole = useDeleteWithoutEnv();

  return useMutation<void, Error>({
    mutationFn: (role) => deleteRole(`/api/v2/role_assignment/${user}?role=${role})`),
    mutationKey: ["delete_role_from_user", user],
    ...options,
  });
};
