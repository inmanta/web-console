import { useContext } from "react";
import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { EnvironmentSettings } from "@/Core";
import { KeyFactory, keySlices } from "@/Data/Managers/KeyFactory";
import { usePost } from "@/Data/Queries";
import { DependencyContext } from "@/UI";

/**
 * Interface for the parameters for the update environment setting mutation.
 */
interface UpdateParams {
  id: string;
  value: EnvironmentSettings.Value;
}

/**
 * React Query hook for updating an environment setting.
 *
 * @returns {UseMutationResult<void, Error, UpdateParams, unknown>} The mutation object for updating an environment setting.
 */
export const useUpdateEnvironmentSetting = (
  options?: UseMutationOptions<void, Error, UpdateParams>
): UseMutationResult<void, Error, UpdateParams> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env);
  const queryClient = useQueryClient();
  const keyFactory = new KeyFactory(keySlices.environment, "get_environment_setting");

  return useMutation({
    mutationFn: ({ id, value }) => post(`/api/v2/environment_settings/${id}`, { value }),
    mutationKey: ["update_environment_setting", env],
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: keyFactory.root() });
    },
    ...options,
  });
};
