import { Resource } from "@/Core/Domain";

/**
 * A single string-valued field of a {@link ResourceActionFilter} (GraphQL StrFilter).
 * Mirrors the operators accepted by the filtered scheduler endpoints.
 */
export interface StringMatch {
  eq?: string[];
  neq?: string[];
  contains?: string[];
  notContains?: string[];
}

/**
 * An enum-valued field of a {@link ResourceActionFilter} (GraphQL *EnumFilter). Enum filters only
 * match on equality, against the enum's own value type rather than a free string.
 */
export interface EnumMatch<T> {
  eq?: T[];
  neq?: T[];
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
  blocked?: EnumMatch<Resource.BlockedValue>;
  compliance?: EnumMatch<Resource.ComplianceValue>;
  lastHandlerRun?: EnumMatch<Resource.LastHandlerRunValue>;
  isDeploying?: boolean;
  modelVersion?: number;
  serviceEntity?: string[];
  serviceInstance?: string[];
  lifecycleState?: string[];
  includeOwned?: boolean;
  instanceVersion?: number;
}
