/**
 * A single string-valued field of a {@link ResourceActionFilter}.
 * Mirrors the GraphQL ResourceFilter operators accepted by the filtered scheduler endpoints.
 */
export interface StringMatch {
  eq?: string[];
  neq?: string[];
  contains?: string[];
  notContains?: string[];
}

/**
 * The resource filter shared by the resources GraphQL query and the filtered scheduler endpoints
 * (deploy/repair/dry run). Both sides speak the same shape, so an entry point composes the scope
 * once and the server resolves it. A single resource is expressed as a filter of one, by pinning
 * resourceType/agent/resourceIdValue with the eq operator.
 *
 * @example { resourceType: { eq: ["std::File"] }, agent: { eq: ["internal"] }, resourceIdValue: { eq: ["/tmp/f"] }, isOrphan: false }
 */
export interface ResourceActionFilter {
  isOrphan?: boolean;
  resourceType?: StringMatch;
  resourceIdValue?: StringMatch;
  agent?: StringMatch;
  purged?: boolean;
  blocked?: StringMatch;
  compliance?: StringMatch;
  lastHandlerRun?: StringMatch;
  isDeploying?: boolean;
  modelVersion?: number;
  serviceEntity?: string[];
  serviceInstance?: string[];
  lifecycleState?: string[];
  includeOwned?: boolean;
  instanceVersion?: number;
}
