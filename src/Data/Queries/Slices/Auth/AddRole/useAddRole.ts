import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { usePostWithoutEnv } from "@/Data/Queries";

/**
 * Represents the roles for a given environment.
 */
export type EnvironmentRoles = Record<string, string[]>;

/**
 * Adds a role to a user, for a specific environment.
 * @param username - The username of the user.
 * @param options - The options for the mutation.
 * @returns The mutation result.
 */
export const useAddRole = (
  username: string,
  options?: UseMutationOptions<void, Error, { role: string; environment: string }, unknown>
) => {
  const post = usePostWithoutEnv()<{ role: string; environment: string }>;

  return useMutation<void, Error, { role: string; environment: string }>({
    mutationFn: (body) => post(`/api/v2/role_assignment/${username}`, body),
    mutationKey: ["update-roles"],
    ...options,
  });
};
