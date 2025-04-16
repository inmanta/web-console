import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { usePost } from "../../helpers";

/**
 * Interface representing the request body for agent deployment
 */
interface Body {
  agent_trigger_method: string;
  agents?: string[];
}

/**
 * Parameters for the useDeploy mutation function
 * @property {string} method - The deployment method, either "Deploy" for incremental deployment or "Repair" for full deployment
 * @property {string[]} [agents] - Optional array of agent IDs to deploy or repair. If not provided, all agents will be affected
 */
type Params = {
  method: DeployAction;
  agents?: string[];
};

export enum DeployAction {
  deploy = "Deploy",
  repair = "Repair",
}

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
