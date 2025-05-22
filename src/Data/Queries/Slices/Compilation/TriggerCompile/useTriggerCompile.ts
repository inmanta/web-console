import { UseBaseMutationResult, useMutation, UseMutationOptions } from "@tanstack/react-query";
import { usePostWithoutEnv } from "@/Data/Queries";

interface Body {
  update: boolean;
  metadata: {
    type: string;
    message: string;
  };
}

interface Params {
  env: string;
  update: boolean;
}

/**
 * React Query hook to trigger a compile
 *
 * @returns {TriggerCompile} An object containing the trigger function
 * @returns {Promise<void>} Function to trigger a compile with optional update parameter
 */
export const useTriggerCompile = (
  options?: UseMutationOptions<void, Error, Params>
): UseBaseMutationResult<void, Error, Params> => {
  const post = usePostWithoutEnv()<Body>;

  return useMutation({
    mutationFn: ({ env, update }) =>
      post(`/api/v1/notify/${env}`, {
        update,
        metadata: {
          type: "console",
          message: "Compile triggered from the console",
        },
      }),
    mutationKey: ["trigger_compile"],
    ...options,
  });
};
