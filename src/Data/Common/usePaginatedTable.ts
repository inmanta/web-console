import { useEffect } from "react";
import { PageSize, RouteKind, Sort } from "@/Core";
import {
  useUrlStateWithCurrentPage,
  useUrlStateWithPageSize,
  useUrlStateWithFilter,
  useUrlStateWithSort,
  useUrlStateWithMultiSort,
  CurrentPage,
} from ".";

interface BaseOptions<TFilter> {
  route: RouteKind;
  defaultFilter?: TFilter;
  filterKeys?: Record<string, "IntRange" | "DateRange" | "Boolean">;
}

interface SingleSortOptions<TFilter, TSort extends string> extends BaseOptions<TFilter> {
  multiSort?: false;
  defaultSort?: Sort.Type<TSort>;
}

interface MultiSortOptions<TFilter, TSort extends string> extends BaseOptions<TFilter> {
  multiSort: true;
  defaultSort?: Sort.MultiSort<TSort>;
}

export function usePaginatedTable<TFilter = undefined, TSort extends string = string>(
  options: MultiSortOptions<TFilter, TSort>
): {
  currentPage: CurrentPage;
  setCurrentPage: (currentPage: CurrentPage) => void;
  pageSize: PageSize.Type;
  setPageSize: (size: PageSize.Type) => void;
  filter: TFilter;
  setFilter: (filter: TFilter) => void;
  sort: Sort.MultiSort<TSort>;
  setSort: (sort: Sort.MultiSort<TSort>) => void;
};

export function usePaginatedTable<TFilter = undefined, TSort extends string = string>(
  options: SingleSortOptions<TFilter, TSort>
): {
  currentPage: CurrentPage;
  setCurrentPage: (currentPage: CurrentPage) => void;
  pageSize: PageSize.Type;
  setPageSize: (size: PageSize.Type) => void;
  filter: TFilter;
  setFilter: (filter: TFilter) => void;
  sort: Sort.Type<TSort>;
  setSort: (sort: Sort.Type<TSort>) => void;
};

/**
 * Composites all URL-synced state needed for a paginated, filterable, sortable table.
 *
 * Manages four pieces of state in the URL:
 * - `currentPage` — the current pagination cursor
 * - `pageSize`    — number of rows per page
 * - `filter`      — typed filter object, shape determined by `TFilter`
 * - `sort`        — either a single {@link Sort.Type} or a {@link Sort.MultiSort} array,
 *                   depending on whether `multiSort: true` is passed
 *
 * Resets `currentPage` automatically whenever sort or filter changes.
 *
 * @remarks
 * Both `useUrlStateWithSort` and `useUrlStateWithMultiSort` are always called
 * unconditionally to satisfy React's rules of hooks. Only the one matching
 * `multiSort` is actually active; the other returns its default silently
 * because its URL key won't be present.
 *
 * Sort and filter URL state is purely reactive — no params are written to the
 * URL unless `setSort`/`setFilter` are explicitly called by the consumer.
 *
 * @overload Pass `multiSort: true` to get `sort: Sort.MultiSort<TSort>`.
 * @overload Omit `multiSort` (or pass `false`) to get `sort: Sort.Type<TSort>`.
 *
 * @example Single sort (existing usage, no changes needed)
 * const { sort, setSort, filter, setFilter } = usePaginatedTable({
 *   route: RouteKind.MyRoute,
 *   defaultSort: { name: "createdAt", order: "desc" },
 * });
 *
 * @example Multi sort
 * const { sort, setSort } = usePaginatedTable({
 *   route: RouteKind.MyRoute,
 *   multiSort: true,
 *   defaultSort: [{ name: "status", order: "asc" }],
 * });
 * // Toggle a column on header click:
 * setSort(Sort.toggleMulti(sort, "status"));
 */
export function usePaginatedTable<TFilter = undefined, TSort extends string = string>(
  options: SingleSortOptions<TFilter, TSort> | MultiSortOptions<TFilter, TSort>
) {
  const { route, defaultFilter, filterKeys } = options;
  const isMulti = options.multiSort === true;

  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({ route });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({ route });
  const [filter, setFilter] = useUrlStateWithFilter<TFilter>({
    route,
    keys: filterKeys,
    default: defaultFilter,
  });

  const [singleSort, setSingleSort] = useUrlStateWithSort<TSort>({
    default: (!isMulti ? options.defaultSort : undefined) ?? {
      name: "" as TSort,
      order: "asc",
    },
    route,
  });

  const [multiSort, setMultiSort] = useUrlStateWithMultiSort<TSort>({
    default: isMulti ? (options.defaultSort ?? []) : [],
    route,
  });

  const sort = isMulti ? multiSort : singleSort;

  useEffect(() => {
    setCurrentPage({ kind: "CurrentPage", value: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, filter]);

  if (isMulti) {
    return {
      currentPage,
      setCurrentPage,
      pageSize,
      setPageSize,
      filter,
      setFilter,
      sort: multiSort,
      setSort: setMultiSort,
    };
  }

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    filter,
    setFilter,
    sort: singleSort,
    setSort: setSingleSort,
  };
}
