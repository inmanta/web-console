import type { ResourceFilter } from "@inmanta/web-console-core/Domain/GraphQL/generated/graphql";

/**
 * The resource filter shared by the resources GraphQL query and the filtered scheduler endpoints
 * (deploy/repair/dry run). Both sides speak the GraphQL ResourceFilter shape minus environment,
 * which the query passes inside the filter and deploy_filtered takes from the URL, so an entry
 * point composes the scope once and the server resolves it. A single resource is expressed as a
 * filter of one, by pinning resourceType/agent/resourceIdValue with the eq operator.
 *
 * @example { resourceType: { eq: ["std::File"] }, agent: { eq: ["internal"] }, resourceIdValue: { eq: ["/tmp/f"] }, isOrphan: false }
 */
export type ResourceActionFilter = Omit<ResourceFilter, "environment">;
