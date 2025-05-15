import { useContext } from "react";
import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ModifyEnvironmentParams } from "@/Core";
import { DependencyContext } from "@/UI";
import { usePost } from "../../helpers";

/**
 * React Query hook for modifying an environment.
 *
 * @returns {UseMutationResult<void, Error, ModifyEnvironmentParams, unknown>} The mutation object for modifying an environment.
 */
export const useModifyEnvironment = (
  environmentId: string,
  options?: UseMutationOptions<void, Error, ModifyEnvironmentParams>
): UseMutationResult<void, Error, ModifyEnvironmentParams> => {
  const client = useQueryClient();
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env)<ModifyEnvironmentParams>;

  return useMutation({
    mutationFn: (params) => post(`/api/v2/environment/${environmentId}`, params),
    mutationKey: ["modify_environment", environmentId],
    onSuccess: () => {
      client.refetchQueries();
    },
    ...options,
  });
};
