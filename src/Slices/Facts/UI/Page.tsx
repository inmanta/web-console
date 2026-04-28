import React from "react";
import { usePaginatedTable } from "@/Data";
import { useGetFacts } from "@/Data/Queries";
import { Filter, SortKey } from "@/Slices/Facts/Core/Types";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PageContainer,
  PaginationWidget,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { FactsTable } from "./FactsTable";
import { FactsTablePresenter } from "./FactsTablePresenter";
import { TableControls } from "./TableControls";

export const Page: React.FC = () => {
  const { currentPage, setCurrentPage, pageSize, setPageSize, filter, setFilter, sort, setSort } =
    usePaginatedTable<Filter, SortKey>({
      route: "Facts",
      defaultSort: { name: "name", order: "asc" },
    });

  const { data, isSuccess, isError, error, refetch } = useGetFacts({
    pageSize,
    filter,
    sort,
    currentPage,
  }).useContinuous();

  const tablePresenter = new FactsTablePresenter();

  if (isError) {
    return (
      <PageContainer pageTitle={words("facts.title")}>
        <ErrorView message={error.message} retry={refetch} ariaLabel="Facts-Failed" />
      </PageContainer>
    );
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
