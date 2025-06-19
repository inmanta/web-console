import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { usePostWithoutEnv } from "@/Data/Queries";

export interface AddRoleToUserBody {
  environment: string;
  role: string;
}

/**
 * Custom hook for adding a role to a user.
 * @param {string} user - The username of the user to add the role to.
 * @returns {Mutation<void, Error, AddRoleToUserBody>} - The mutation function.
 */
export const useAddRoleToUser = ({
  user,
  options,
}: {
  user: string;
  options?: UseMutationOptions<void, Error, AddRoleToUserBody>;
}) => {
  const post = usePostWithoutEnv()<AddRoleToUserBody>;

  return useMutation<void, Error, AddRoleToUserBody>({
    mutationFn: (body) => post(`/api/v2/role_assignment/${user}`, body),
    mutationKey: ["add_role_to_user", user],
    ...options,
  });
};
