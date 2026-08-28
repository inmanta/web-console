import { useContext } from "react";
import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { usePost } from "@/Data/Queries";
import { DependencyContext } from "@/UI";

/**
 * Enum that represents the different kinds of actions for method to deploy agents.
 */
export enum DeployAgentsAction {
  deploy = "Deploy",
  repair = "Repair",
}

/**
 * The scheduler's trigger method for a deploy (incremental) or repair (full) action.
 */
export type AgentTriggerMethod = "push_incremental_deploy" | "push_full_deploy";

/**
 * Maps a deploy/repair action to the scheduler's agent_trigger_method.
 * Shared so every deploy entry point (agents-scoped and filter-scoped) stays in sync.
 *
 * @example toAgentTriggerMethod(DeployAgentsAction.repair) === "push_full_deploy"
 */
export const toAgentTriggerMethod = (method: DeployAgentsAction): AgentTriggerMethod =>
  method === DeployAgentsAction.deploy ? "push_incremental_deploy" : "push_full_deploy";

/**
 * Interface representing the request body for agent deployment
 */
interface Body {
  agent_trigger_method: AgentTriggerMethod;
  agents?: string[];
}

/**
 * Parameters for the useDeployAgents mutation function
 * @property {string} method - The deployment method, either "Deploy" for incremental deployment or "Repair" for full deployment
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
        agent_trigger_method: toAgentTriggerMethod(method),
        agents: agents,
      }),
    mutationKey: ["deploy_agents", env],
    ...options,
  });
};
