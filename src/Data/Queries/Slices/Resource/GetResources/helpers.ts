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
  isOrphan: boolean;
  lastHandlerRun: { eq: Resource.LastHandlerRun[] };
  compliance: { eq: Resource.Compliance[] };
  blocked: { eq: Resource.Blocked[] };
}>;

export function isCompoundStateKey(value: string): value is Resource.CompoundStateKey {
  return value in STATUS_FIELD_MAP;
}

/**
 * Maps a filter.status array to GraphQL ResourceFilter fields.
 * Supports orphaned/!orphaned mapping and compound states.
 * For compound states, it maps status values to their corresponding field with an eq operator.
 */
export function mapStatusToGraphQLFilter(status?: string[]): GraphQLStateFilter {
  if (!status?.length) return {};

  const filter: GraphQLStateFilter = {};

  const lastHandlerRun: Resource.LastHandlerRun[] = [];
  const compliance: Resource.Compliance[] = [];
  const blocked: Resource.Blocked[] = [];

  for (const s of status) {
    if (s === "orphaned") {
      filter.isOrphan = true;
      continue;
    }

    if (s === "!orphaned") {
      filter.isOrphan = false;
      continue;
    }

    if (!isCompoundStateKey(s)) continue;

    const { field, value } = STATUS_FIELD_MAP[s];

    switch (field) {
      case "lastHandlerRun":
        lastHandlerRun.push(value);
        break;

      case "compliance":
        compliance.push(value);
        break;

      case "blocked":
        blocked.push(value);
        break;
    }
  }

  if (lastHandlerRun.length) {
    filter.lastHandlerRun = { eq: lastHandlerRun };
  }

  if (compliance.length) {
    filter.compliance = { eq: compliance };
  }

  if (blocked.length) {
    filter.blocked = { eq: blocked };
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
      ? `after=${pageInfo.endCursor}&beforeCount=${currentBeforeCount + pageSize}`
      : undefined;

  const prevBeforeCount = Math.max(0, currentBeforeCount - pageSize);
  const prev =
    pageInfo.hasPreviousPage && pageInfo.startCursor
      ? `before=${pageInfo.startCursor}&beforeCount=${prevBeforeCount}`
      : undefined;

  return { next, prev };
}
