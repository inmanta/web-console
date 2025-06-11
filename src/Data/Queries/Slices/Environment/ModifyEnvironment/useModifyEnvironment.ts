import { useContext } from "react";
import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ModifyEnvironmentParams } from "@/Core";
import { GetEnvironmentPreviewKey, usePost } from "@/Data/Queries";
import { DependencyContext } from "@/UI";
import { getEnvironmentDetailsKey } from "../GetEnvironmentDetails";
import { getEnvironmentsKey } from "../GetEnvironments";

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
    mutationKey: ["modify_environment", environmentId, env],
    onSuccess: () => {
      client.refetchQueries({ queryKey: getEnvironmentDetailsKey.root() });
      client.refetchQueries({ queryKey: getEnvironmentsKey.root() });
      client.refetchQueries({ queryKey: GetEnvironmentPreviewKey.root() });
    },
    ...options,
  });
};
