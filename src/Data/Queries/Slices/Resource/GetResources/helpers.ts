import { Resource, Sort } from "@/Core/Domain";
import { Handlers } from "@/Core/Domain/Pagination/Pagination";
import { CurrentPage } from "@/Data/Common";

/** All compound state enums */
const COMPOUND_STATE_ENUMS: {
  [K in keyof Resource.CompoundState]: { [key: string]: Resource.CompoundStateType };
} = {
  blocked: Resource.BlockedState,
  compliance: Resource.ComplianceState,
  lastHandlerRun: Resource.LastHandlerRunState,
};

/** Mapping of CompoundStateType values to their corresponding fields in CompoundState.
 * This is used to determine which field to update when a status filter is toggled.
 */
export const STATE_FIELD_MAP: Record<Resource.CompoundStateType, keyof Resource.CompoundState> =
  Object.fromEntries(
    Object.entries(COMPOUND_STATE_ENUMS).flatMap(([field, enumObj]) =>
      Object.values(enumObj).map((v) => [v, field])
    )
  ) as Record<Resource.CompoundStateType, keyof Resource.CompoundState>;

/**
 * Maps a filter.status array to GraphQL ResourceFilter fields.
 * Supports orphaned/!orphaned mapping and compound states.
 * For compound states, it maps status values to their corresponding field with an eq operator.
 */
export function mapStatusToGraphQLFilter(
  status: string[] | undefined
): { isOrphan?: boolean } & Partial<
  Record<keyof Resource.CompoundState, { eq: Resource.CompoundStateUpperType }>
> {
  if (!status || status.length === 0) return {};

  return status.reduce((filter, s) => {
    if (s === "!orphaned") return { ...filter, isOrphan: false };
    if (s === "orphaned") return { ...filter, isOrphan: true };

    const field = STATE_FIELD_MAP[s];
    if (field) return { ...filter, [field]: { eq: s.toUpperCase() } };

    return filter;
  }, {});
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
 * Parses the currentPage URL state value into a GraphQL after-cursor and before-offset.
 * Format: "" (first page) or "after=<cursor>&before=<N>"
 */
export function parseCurrentPage(currentPage: CurrentPage): {
  after: string | undefined;
  before: number;
} {
  if (!currentPage.value) {
    return { after: undefined, before: 0 };
  }

  const params = new URLSearchParams(currentPage.value);
  const after = params.get("after") ?? undefined;
  const before = parseInt(params.get("before") ?? "0", 10);

  return { after, before };
}

/**
 * Builds pagination handlers from GraphQL pageInfo.
 */
export function buildHandlers(
  pageInfo: { hasNextPage: boolean; endCursor: string | null },
  currentBefore: number,
  pageSize: number
): Handlers {
  const nextBefore = currentBefore + pageSize;
  const next =
    pageInfo.hasNextPage && pageInfo.endCursor
      ? `after=${pageInfo.endCursor}&before=${nextBefore}`
      : undefined;

  return { next };
}
