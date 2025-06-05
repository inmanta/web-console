import { useContext } from "react";
import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useDelete } from "@/Data/Queries";
import { DependencyContext } from "@/UI";
import { getEnvironmentSettingsKey } from "../GetEnvironmentSettings";

/**
 * React Query hook for resetting an environment setting to its default value.
 *
 * @returns {UseMutationResult<void, Error, string, unknown>} The mutation object for resetting an environment setting.
 */
export const useResetEnvironmentSetting = (
  options?: UseMutationOptions<void, Error, string>
): UseMutationResult<void, Error, string> => {
  const client = useQueryClient();
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const deleteFn = useDelete(env);

  return useMutation({
    mutationFn: (id) => deleteFn(`/api/v2/environment_settings/${id}`),
    mutationKey: ["reset_environment_setting", env],
    onSuccess: () => {
      client.refetchQueries({ queryKey: getEnvironmentSettingsKey.root() });
    },
    ...options,
  });
};
