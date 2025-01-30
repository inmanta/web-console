import {
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { Dict } from "@/UI/Components";
import { usePost } from "../../helpers/useQueries";

interface ConfigUpdate {
  id: string;
  value: string | boolean | ParsedNumber | Dict;
}

/**
 * React Query hook for updating environment configuration settings.
 *
 * @returns {UseMutationResult<void, Error, ConfigUpdate, unknown>}- The mutation object from `useMutation` hook.
 */
export const useUpdateEnvConfig = (): UseMutationResult<
  void,
  Error,
  ConfigUpdate,
  unknown
> => {
  const client = useQueryClient();

  const post = usePost()<string | boolean | ParsedNumber | Dict>;

  return useMutation({
    mutationFn: ({ id, value }) =>
      post(`/api/v2/environment_settings/${id}`, value),
    mutationKey: ["update_env_config"],
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: ["get_env_config"], //for the future rework of the env getter
      });
      client.invalidateQueries({
        queryKey: ["get_env_details"], //for the future rework of the env getter
      });
      document.dispatchEvent(new Event("settings-update"));
    },
  });
};
