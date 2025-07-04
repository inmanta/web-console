import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { usePatchWithoutEnv } from "@/Data/Queries";

interface ChangeUserPasswordBody {
  password: string;
}

/**
 * Custom hook for changing a user's password.
 * @param user - The username of the user to change the password for.
 * @param options - The options for the mutation.
 * @returns A tuple containing the mutation function and mutation state.
 */
export const useChangeUserPassword = (
  user: string,
  options: UseMutationOptions<void, Error, ChangeUserPasswordBody> = {}
) => {
  const patch = usePatchWithoutEnv()<ChangeUserPasswordBody>;

  return useMutation<void, Error, ChangeUserPasswordBody>({
    mutationFn: (body) => patch(`/api/v2/user/${user}/password`, body),
    mutationKey: ["change-user-password"],
    ...options,
  });
};
