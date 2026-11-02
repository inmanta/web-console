import { useContext } from "react";
import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ModifyEnvironmentParams } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { usePost } from "@inmanta/web-console-core/Queries/Helpers";
import { getEnvironmentDetailsKey } from "../GetEnvironmentDetails";
import { GetEnvironmentPreviewKey } from "../GetEnvironmentPreview/useGetEnvironmentPreview";
import { getEnvironmentsKey } from "../GetEnvironments";

/**
 * React Query hook for modifying an environment. On success it refetches the environment details,
 * the environment list and the preview, then calls the caller's own `onSuccess`.
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
    ...options,
    onSuccess: (...args) => {
      client.refetchQueries({ queryKey: getEnvironmentDetailsKey.root() });
      client.refetchQueries({ queryKey: getEnvironmentsKey.root() });
      client.refetchQueries({ queryKey: GetEnvironmentPreviewKey.root() });

      return options?.onSuccess?.(...args);
    },
  });
};
