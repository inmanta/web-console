import { Resource, Sort } from "@/Core/Domain";
import { Handlers } from "@/Core/Domain/Pagination/Pagination";
import { CurrentPage } from "@/Data/Common";
import { PageInfo } from "./useGetResources";

//TODO: mapping should still be re-evaluated again => https://github.com/inmanta/web-console/issues/6814
/** This is used to map the statusses of all compound states correctly */
const STATUS_FIELD_MAP = {
  // --- LastHandlerRun ---
  failed: { field: "lastHandlerRun", value: "FAILED" },
  skipped: { field: "lastHandlerRun", value: "SKIPPED" },
  successful: { field: "lastHandlerRun", value: "SUCCESSFUL" },
  new: { field: "lastHandlerRun", value: "NEW" },
  // --- Compliance ---
  compliant: { field: "compliance", value: "COMPLIANT" },
  non_compliant: { field: "compliance", value: "NON_COMPLIANT" },
  has_update: { field: "compliance", value: "HAS_UPDATE" },
  undefined: { field: "compliance", value: "UNDEFINED" },
  // --- Blocked---
  blocked: { field: "blocked", value: "BLOCKED" },
  not_blocked: { field: "blocked", value: "NOT_BLOCKED" },
  temporarily_blocked: { field: "blocked", value: "TEMPORARILY_BLOCKED" },
} satisfies Record<
  Resource.CompoundStateKey,
  {
    field: keyof Resource.CompoundStateSummary;
    value: Resource.CompoundState;
  }
>;

type GraphQLStateFilter = Partial<{
  purged: boolean;
  isOrphan: boolean;
  isDeploying: boolean;
  lastHandlerRun: { eq?: Resource.LastHandlerRun[]; neq?: Resource.LastHandlerRun[] };
  compliance: { eq?: Resource.Compliance[]; neq?: Resource.Compliance[] };
  blocked: { eq?: Resource.Blocked[]; neq?: Resource.Blocked[] };
}>;

function isCompoundStateKey(value: string): value is Resource.CompoundStateKey {
  return value in STATUS_FIELD_MAP;
}

/**
 * Maps a filter.status array to GraphQL ResourceFilter fields.
 * Supports orphaned/!orphaned, purged mapping and compound states.
 * For compound states, it maps status values to their corresponding field with an eq operator.
 */
export function mapStatusToGraphQLFilter(statusses?: string[]): GraphQLStateFilter {
  if (!statusses?.length) return {};

  const filter: GraphQLStateFilter = {};

  const lastHandlerRun: { eq: Resource.LastHandlerRun[]; neq: Resource.LastHandlerRun[] } = {
    eq: [],
    neq: [],
  };
  const compliance: { eq: Resource.Compliance[]; neq: Resource.Compliance[] } = { eq: [], neq: [] };
  const blocked: { eq: Resource.Blocked[]; neq: Resource.Blocked[] } = { eq: [], neq: [] };

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

    if (!isCompoundStateKey(key)) continue;

    const { field, value } = STATUS_FIELD_MAP[key];

    switch (field) {
      case "lastHandlerRun":
        lastHandlerRun[operator].push(value);
        break;
      case "compliance":
        compliance[operator].push(value);
        break;
      case "blocked":
        blocked[operator].push(value);
        break;
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
 * Maps sort parameters to the GraphQL orderBy format.
 */
export function mapSort(
  sort: Sort.Type<Resource.SortKey> | undefined
): Array<{ key: string; order: string }> | undefined {
  if (!sort) return undefined;

  return [{ key: sort.name, order: sort.order }];
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
