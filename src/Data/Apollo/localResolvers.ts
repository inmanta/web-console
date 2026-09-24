import { Resource } from "@/Core/Domain";
import type {
  SetResourceHealthMutation,
  SetResourceHealthMutationVariables,
} from "@/Data/Apollo/gql/graphql";

/**
 * Resolvers for the `@client` fields and mutations in the client schema. Apollo runs them in the browser
 * and writes what they return into the cache, like it would with a response from the orchestrator.
 */

/**
 * Creates the local resolvers. `pausePolling` is called after a local change, so the next poll
 * doesn't replace it with the orchestrator's data right away.
 *
 * @example
 * const resolvers = createLocalResolvers({ pausePolling: () => poll.pause(30_000) });
 * resolvers.Mutation.setResourceHealth(null, { resourceId: "std::File[a,path=/x]", healthy: false })
 * // { __typename: "Resource", resourceId: "std::File[a,path=/x]", state: { lastHandlerRun: "FAILED", compliance: "UNDEFINED", blocked: "BLOCKED", ... } }
 */
export const createLocalResolvers = ({ pausePolling }: { pausePolling: () => void }) => ({
  Mutation: {
    // Returns what the orchestrator would send back for this mutation: the changed resource, with its typenames.
    setResourceHealth: (
      _root: unknown,
      { resourceId, healthy }: SetResourceHealthMutationVariables
    ): SetResourceHealthMutation["setResourceHealth"] => {
      pausePolling();

      return {
        __typename: "Resource",
        resourceId,
        state: {
          __typename: "ResourcePersistentState",
          resourceId,
          lastHandlerRun: healthy
            ? Resource.LAST_HANDLER_RUN.successful
            : Resource.LAST_HANDLER_RUN.failed,
          compliance: healthy ? Resource.COMPLIANCE.compliant : Resource.COMPLIANCE.undefined,
          blocked: healthy ? Resource.BLOCKED.not_blocked : Resource.BLOCKED.blocked,
          isDeploying: false,
        },
      };
    },
  },
});
