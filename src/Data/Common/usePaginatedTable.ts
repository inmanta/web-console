import { useEffect } from "react";
import { RouteKind, Sort } from "@/Core";
import {
  useUrlStateWithCurrentPage,
  useUrlStateWithPageSize,
  useUrlStateWithFilter,
  useUrlStateWithSort,
} from "./";

interface UsePaginatedTableOptions<_TFilter, SortKey extends string> {
  route: RouteKind;
  defaultSort?: Sort.Type<SortKey>;
  defaultFilter?: _TFilter;
  filterKeys?: Record<string, "IntRange" | "DateRange" | "Boolean">;
}

export function usePaginatedTable<TFilter, TSort extends string>({
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

  //when sorting is triggered, reset the current page
  useEffect(() => {
    setCurrentPage({ kind: "CurrentPage", value: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort.order]);

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
