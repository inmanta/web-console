import { Resource, ResourceActionFilter } from "@/Core";
import { Handlers } from "@/Core/Domain/Pagination/Pagination";
import { CurrentPage, MultiSort } from "@/Data/Common";
import { PageInfo } from "./useGetResources";

type GraphQLStateFilter = Pick<
  ResourceActionFilter,
  "purged" | "isOrphan" | "isDeploying" | "lastHandlerRun" | "compliance" | "blocked"
>;

/**
 * Maps a filter.status array to GraphQL ResourceFilter fields.
 * Supports orphaned/!orphaned, purged mapping and compound states.
 * For compound states, it maps status values to their corresponding field with an eq operator.
 */
export function mapStatusToGraphQLFilter(statusses?: string[]): GraphQLStateFilter {
  if (!statusses?.length) {
    return {};
  }

  const filter: GraphQLStateFilter = {};

  const lastHandlerRun: {
    eq: Resource.LastHandlerRunValue[];
    neq: Resource.LastHandlerRunValue[];
  } = {
    eq: [],
    neq: [],
  };
  const compliance: { eq: Resource.ComplianceValue[]; neq: Resource.ComplianceValue[] } = {
    eq: [],
    neq: [],
  };
  const blocked: { eq: Resource.BlockedValue[]; neq: Resource.BlockedValue[] } = {
    eq: [],
    neq: [],
  };

  for (const status of statusses) {
    const isNegated = status.startsWith("!");
    const key = isNegated ? status.slice(1) : status;
    const operator = isNegated ? "neq" : "eq";

    if (key === "isDeploying") {
      filter.isDeploying = !isNegated;
      continue;
    }

    if (key === "orphaned") {
      filter.isOrphan = !isNegated;
      continue;
    }

    if (key === "purged") {
      filter.purged = !isNegated;
      continue;
    }

    if (key in Resource.LAST_HANDLER_RUN) {
      lastHandlerRun[operator].push(Resource.LAST_HANDLER_RUN[key]);
    } else if (key in Resource.COMPLIANCE) {
      compliance[operator].push(Resource.COMPLIANCE[key]);
    } else if (key in Resource.BLOCKED) {
      blocked[operator].push(Resource.BLOCKED[key]);
    }
  }

  if (lastHandlerRun.eq.length || lastHandlerRun.neq.length) {
    filter.lastHandlerRun = {
      ...(lastHandlerRun.eq.length && { eq: lastHandlerRun.eq }),
      ...(lastHandlerRun.neq.length && { neq: lastHandlerRun.neq }),
    };
  }

  if (compliance.eq.length || compliance.neq.length) {
    filter.compliance = {
      ...(compliance.eq.length && { eq: compliance.eq }),
      ...(compliance.neq.length && { neq: compliance.neq }),
    };
  }

  if (blocked.eq.length || blocked.neq.length) {
    filter.blocked = {
      ...(blocked.eq.length && { eq: blocked.eq }),
      ...(blocked.neq.length && { neq: blocked.neq }),
    };
  }

  return filter;
}

/**
 * Maps the resources page UI filter to the GraphQL/deploy_filtered ResourceActionFilter, so the
 * list query and a filter-scoped deploy act on exactly the same set. The environment is left out;
 * the list query adds it as a variable and the deploy endpoint scopes by URL.
 */
export function mapToResourceActionFilter(filter?: Resource.Filter): ResourceActionFilter {
  const result: ResourceActionFilter = {};

  if (filter?.type?.length) {
    result.resourceType = { contains: filter.type.map((type) => `%${type}%`) };
  }

  if (filter?.agent?.length) {
    result.agent = { contains: filter.agent.map((agent) => `%${agent}%`) };
  }

  if (filter?.value?.length) {
    result.resourceIdValue = { contains: filter.value.map((value) => `%${value}%`) };
  }

  if (filter?.serviceEntity?.length) {
    result.serviceEntity = filter.serviceEntity;
  }

  if (filter?.serviceInstance?.length) {
    result.serviceInstance = filter.serviceInstance.map(
      (value) => Resource.parseServiceInstanceFilterValue(value).id
    );
  }

  if (filter?.includeOwned) {
    result.includeOwned = true;
  }

  return {
    ...result,
    ...mapStatusToGraphQLFilter(filter?.status),
  };
}

/**
 * Gets the label of each service instance in a Resources page filter, keyed by instance id, as its
 * filter value carries it. An instance without a label of its own carries its id instead, and is
 * left out.
 *
 * @example getFilterInstanceLabels({ serviceInstance: ['{"id":"abc","label":"cpe-1"}'] }) // { abc: "cpe-1" }
 */
export function getFilterInstanceLabels(filter?: Resource.Filter): Record<string, string> {
  const instanceLabels: Record<string, string> = {};

  for (const value of filter?.serviceInstance ?? []) {
    const { id, label } = Resource.parseServiceInstanceFilterValue(value);

    if (label !== id) {
      instanceLabels[id] = label;
    }
  }

  return instanceLabels;
}

/**
 * Maps sort parameters to the GraphQL orderBy format.
 * Preserves array order as sort priority.
 */
export function mapSort(sort: MultiSort<Resource.SortKey>): Array<{ key: string; order: string }> {
  return sort.map((s) => ({ key: s.name, order: s.order }));
}

/**
 * Parses the currentPage URL state value.
 * Format: "after=<cursor>&beforeCount=<N>" (forward)
 *      or "before=<cursor>&beforeCount=<N>" (backward)
 *
 * "beforeCount" is purely for metadata offset calculation.
 */
export function parseCurrentPage(currentPage: CurrentPage): {
  after: string | undefined; // GraphQL forward cursor
  before: string | undefined; // GraphQL backward cursor
  beforeCount: number; // metadata offset (how many items precede current page)
} {
  if (!currentPage.value) {
    return { after: undefined, before: undefined, beforeCount: 0 };
  }

  const params = new URLSearchParams(currentPage.value);
  const after = params.get("after") ?? undefined;
  const before = params.get("before") ?? undefined;
  const beforeCount = parseInt(params.get("beforeCount") ?? "0", 10);

  return { after, before, beforeCount };
}

/**
 * Builds next/prev pagination handlers from GraphQL pageInfo.
 */
export function buildHandlers(
  pageInfo: PageInfo,
  currentBeforeCount: number,
  pageSize: number
): Handlers {
  const next =
    pageInfo.hasNextPage && pageInfo.endCursor
      ? `after=${encodeURIComponent(pageInfo.endCursor)}&beforeCount=${currentBeforeCount + pageSize}`
      : undefined;

  const prevBeforeCount = Math.max(0, currentBeforeCount - pageSize);
  const prev =
    pageInfo.hasPreviousPage && pageInfo.startCursor
      ? `before=${encodeURIComponent(pageInfo.startCursor)}&beforeCount=${prevBeforeCount}`
      : undefined;

  return { next, prev };
}
