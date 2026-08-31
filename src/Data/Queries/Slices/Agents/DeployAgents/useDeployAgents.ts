import { useContext } from "react";
import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { usePost } from "@/Data/Queries";
import { DependencyContext } from "@/UI";

/**
 * Deploy (incremental) or repair (full) action. The value is the scheduler's agent_trigger_method
 */
export enum DeployAgentsAction {
  deploy = "push_incremental_deploy",
  repair = "push_full_deploy",
}

/**
 * Interface representing the request body for agent deployment
 */
interface Body {
  agent_trigger_method: DeployAgentsAction;
  agents?: string[];
}

/**
 * Parameters for the useDeployAgents mutation function
 * @property {DeployAgentsAction} method - Deploy (incremental) or repair (full)
 * @property {string[]} [agents] - Optional array of agent IDs to deploy or repair. If not provided, all agents will be affected
 */
type Params = {
  method: DeployAgentsAction;
  agents?: string[];
};

/**
 * React Query hook for repairing or deploying Agents
 *
 * @returns {Mutation} The mutation object for sending the request.
 */
export const useDeployAgents = (
  options?: UseMutationOptions<void, Error, Params>
): UseMutationResult<void, Error, Params> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env)<Body>;

  return useMutation({
    mutationFn: ({ method, agents }) =>
      post("/api/v1/deploy", {
        agent_trigger_method: method,
        agents: agents,
      }),
    mutationKey: ["deploy_agents", env],
    ...options,
  });
};
