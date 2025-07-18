import { UseMutationResult, UseMutationOptions, useMutation } from "@tanstack/react-query";
import { useDeleteWithoutEnv } from "@/Data/Queries";

/**
 * Deletes a role from a user, for a specific environment.
 * @param username - The username of the user.
 * @param options - The options for the mutation.
 * @returns The mutation result.
 */
export const useDeleteRole = (
  username: string,
  options?: UseMutationOptions<void, Error, { role: string; environment: string }, unknown>
): UseMutationResult<void, Error, { role: string; environment: string }, unknown> => {
  const deleteFn = useDeleteWithoutEnv();

  return useMutation<void, Error, { role: string; environment: string }>({
    mutationFn: ({ role, environment }) =>
      deleteFn(
        `/api/v2/role_assignment/${encodeURIComponent(username)}?role=${encodeURIComponent(role)}&environment=${encodeURIComponent(environment)}`
      ),
    mutationKey: ["delete-role"],
    ...options,
  });
};
