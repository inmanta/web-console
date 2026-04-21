import { useEffect } from "react";
import { RouteKind, Sort } from "@/Core";
import {
  useUrlStateWithCurrentPage,
  useUrlStateWithPageSize,
  useUrlStateWithFilter,
  useUrlStateWithSort,
} from "./";

interface UsePaginatedTableOptions<TFilter = undefined, TSort extends string = string> {
  route: RouteKind;
  defaultSort?: Sort.Type<TSort>;
  defaultFilter?: TFilter;
  filterKeys?: Record<string, "IntRange" | "DateRange" | "Boolean">;
}

/**
 * Note: sort and filter URL state is purely reactive — no params are written
 * to the URL unless setSort/setFilter are explicitly called by the consumer.
 * Unused return values have no side effects.
 */
export function usePaginatedTable<TFilter = undefined, TSort extends string = string>({
  route,
  defaultSort,
  defaultFilter,
  filterKeys,
}: UsePaginatedTableOptions<TFilter, TSort>) {
  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({ route });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({ route });
  const [filter, setFilter] = useUrlStateWithFilter<TFilter>({
    route,
    keys: filterKeys,
    default: defaultFilter,
  });
  const [sort, setSort] = useUrlStateWithSort<TSort>({
    default: defaultSort ?? { name: "" as TSort, order: "asc" },
    route,
  });

  //when sorting or filtering is triggered, reset the current page
  useEffect(() => {
    setCurrentPage({ kind: "CurrentPage", value: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort.name, sort.order, JSON.stringify(filter)]);

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    filter,
    setFilter,
    sort,
    setSort,
  };
}
