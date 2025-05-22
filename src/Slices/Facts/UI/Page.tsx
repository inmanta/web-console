import React, { useEffect } from "react";
import { useUrlStateWithFilter, useUrlStateWithPageSize, useUrlStateWithSort } from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { useGetFacts } from "@/Data/Queries/Slices/Facts/GetFacts";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PageContainer,
  PaginationWidget,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { Filter, SortKey } from "@/Slices/Facts/Core/Types";
import { FactsTable } from "./FactsTable";
import { FactsTablePresenter } from "./FactsTablePresenter";
import { TableControls } from "./TableControls";

export const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({
    route: "Facts",
  });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "Facts",
  });
  const [filter, setFilter] = useUrlStateWithFilter<Filter>({
    route: "Facts",
  });
  const [sort, setSort] = useUrlStateWithSort<SortKey>({
    default: { name: "name", order: "asc" },
    route: "Facts",
  });

  const { data, isSuccess, isError, error, refetch } = useGetFacts({
    pageSize,
    filter,
    sort,
    currentPage,
  }).useContinuous();

  const tablePresenter = new FactsTablePresenter();

  //when sorting is triggered, reset the current page
  useEffect(() => {
    setCurrentPage({ kind: "CurrentPage", value: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort.order]);

  if (isError) {
    <PageContainer pageTitle={words("facts.title")}>
      <ErrorView message={error.message} retry={refetch} ariaLabel="Facts-Failed" />
    </PageContainer>;
  }

  if (isSuccess) {
    return (
      <PageContainer pageTitle={words("facts.title")}>
        <TableControls
          filter={filter}
          setFilter={setFilter}
          paginationWidget={
            <PaginationWidget
              data={data}
              pageSize={pageSize}
              setPageSize={setPageSize}
              setCurrentPage={setCurrentPage}
            />
          }
        />
        {data.data.length <= 0 ? (
          <EmptyView message={words("facts.empty.message")} aria-label="FactsView-Empty" />
        ) : (
          <FactsTable
            aria-label="Facts-Success"
            rows={tablePresenter.createRows(data.data)}
            tablePresenter={tablePresenter}
            sort={sort}
            setSort={setSort}
          />
        )}
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle={words("facts.title")}>
      <LoadingView ariaLabel="Facts-Loading" />
    </PageContainer>
  );
};
