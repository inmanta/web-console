import { useContext } from "react";
import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { DeployAgentsAction, usePost } from "@/Data/Queries";
import { DependencyContext } from "@/UI";
import { ResourceActionFilter } from "../ResourceActionFilter";

/**
 * Request body for the deploy_filtered endpoint.
 */
interface Body {
  filter: ResourceActionFilter;
  agent_trigger_method: DeployAgentsAction;
}

/**
 * Parameters for the useDeployFiltered mutation function.
 * @property {DeployAgentsAction} method - Whether to deploy (incremental) or repair (full).
 * @property {ResourceActionFilter} filter - The scope the action acts on.
 */
type Params = {
  method: DeployAgentsAction;
  filter: ResourceActionFilter;
};

/**
 * React Query hook for deploying or repairing the resources matching a filter.
 *
 * Unlike {@link useDeployAgents}, which scopes by a list of agents, this targets the
 * filter-based scheduler endpoint, so a single resource, the active list filter or a whole
 * environment are all expressed as one {@link ResourceActionFilter}.
 *
 * The filter is sent as given, so the deployed set matches the filter (and the count derived from
 * the same mapping). Callers that want orphans excluded pass isOrphan: false themselves; anything
 * the scheduler rejects (such as an explicit orphan filter) surfaces as an error toast.
 *
 * @returns {Mutation} The mutation object for sending the request.
 */
export const useDeployFiltered = (
  options?: UseMutationOptions<void, Error, Params>
): UseMutationResult<void, Error, Params> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env)<Body>;

  return useMutation({
    mutationFn: ({ method, filter }) =>
      post("/api/v2/deploy_filtered", {
        filter,
        agent_trigger_method: method,
      }),
    mutationKey: ["deploy_filtered", env],
    ...options,
  });
};
