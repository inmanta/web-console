import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { usePostWithoutEnv } from "@/Data/Queries";

/**
 * Body for adding a role to a user.
 * @param {string} environment - The environment where the role is applied
 * @param {string} role - The role to add to the user.
 */
export interface ManageRoleToUserBody {
  environment: string;
  role: string;
}

/**
 * Custom hook for adding a role to a user.
 * @param {string} user - The username of the user to add the role to.
 * @returns {Mutation<void, Error, ManageRoleToUserBody>} - The mutation function.
 */
export const useAddRoleToUser = ({
  user,
  options,
}: {
  user: string;
  options?: UseMutationOptions<void, Error, ManageRoleToUserBody>;
}) => {
  const post = usePostWithoutEnv()<ManageRoleToUserBody>;

  return useMutation<void, Error, ManageRoleToUserBody>({
    mutationFn: (body) => post(`/api/v2/role_assignment/${user}`, body),
    mutationKey: ["add_role_to_user", user],
    ...options,
  });
};
