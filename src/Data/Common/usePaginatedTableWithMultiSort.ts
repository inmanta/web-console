import { useEffect } from "react";
import { RouteKind } from "@/Core";
import {
  useUrlStateWithCurrentPage,
  useUrlStateWithPageSize,
  useUrlStateWithFilter,
  useUrlStateWithMultiSort,
  MultiSort,
} from ".";

interface Options<TFilter, TSort extends string> {
  route: RouteKind;
  defaultFilter?: TFilter;
  filterKeys?: Record<string, "IntRange" | "DateRange" | "Boolean">;
  defaultSort?: MultiSort<TSort>;
}

/**
 * Composites all URL-synced state needed for a paginated, filterable, multi-sortable table.
 *
 * Manages four pieces of state in the URL:
 * - `currentPage` — the current pagination cursor
 * - `pageSize`    — number of rows per page
 * - `filter`      — typed filter object, shape determined by `TFilter`
 * - `sort`        — a {@link MultiSort} array
 *
 * Resets `currentPage` automatically whenever sort or filter changes.
 *
 * @example
 * const { sort, setSort, filter, setFilter } = usePaginatedTableWithMultiSort({
 *   route: RouteKind.MyRoute,
 *   defaultSort: [{ name: "status", order: "asc" }],
 * });
 * // Toggle a column on header click:
 * setSort(toggleMulti(sort, "status"));
 */
export function usePaginatedTableWithMultiSort<TFilter = undefined, TSort extends string = string>(
  options: Options<TFilter, TSort>
) {
  const { route, defaultFilter, filterKeys, defaultSort = [] } = options;

  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({ route });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({ route });
  const [filter, setFilter] = useUrlStateWithFilter<TFilter>({
    route,
    keys: filterKeys,
    default: defaultFilter,
  });
  const [sort, setSort] = useUrlStateWithMultiSort<TSort>({
    default: defaultSort,
    route,
  });

  useEffect(() => {
    setCurrentPage({ kind: "CurrentPage", value: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, filter]);

  return { currentPage, setCurrentPage, pageSize, setPageSize, filter, setFilter, sort, setSort };
}
