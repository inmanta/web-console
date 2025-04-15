import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usePost } from "../../helpers";

/**
 * Interface for control agents parameters
 */
interface ControlAgentParams {
  name: string;
  action: "pause" | "unpause" | "keep_paused_on_resume" | "unpause_on_resume";
}

/**
 * React Query hook for controlling agent .
 *
 * @returns {UseMutationResult<void, Error, ConfigUpdate, unknown>}- The mutation object from `useMutation` hook.
 */
export const useControlAgent = (
  options?: UseMutationOptions<void, Error, ControlAgentParams, unknown>
): UseMutationResult<void, Error, ControlAgentParams, unknown> => {
  const client = useQueryClient();

  const post = usePost()<null>;

  return useMutation({
    mutationFn: ({ name, action }) =>
      post(`/api/v2/agent/${encodeURIComponent(name)}/${action}`, null),
    mutationKey: ["update_env_config"],
    onSuccess: () => {
      client.refetchQueries({ queryKey: ["get_agents-continuous"], type: "active" });
    },
    ...options,
  });
};
