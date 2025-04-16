import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { usePost } from "../../helpers";

interface Body {
  agent_trigger_method: string;
  agents?: string[];
}

type Params = {
  method: "Deploy" | "Repair";
  agents?: string[];
};

/**
 * React Query hook for repairing or deploying Agents
 *
 * @returns {Mutation} The mutation object for sending the request.
 */
export const useDeploy = (
  options?: UseMutationOptions<void, Error, Params>
): UseMutationResult<void, Error, Params> => {
  const post = usePost()<Body>;

  return useMutation({
    mutationFn: ({ method, agents }) =>
      post("/api/v1/deploy", {
        agent_trigger_method: method === "Deploy" ? "push_incremental_deploy" : "push_full_deploy",
        agents: agents,
      }),
    mutationKey: ["deploy"],
    ...options,
  });
};
