import React from "react";
import { usePaginatedTable } from "@/Data";
import { useGetParameters } from "@/Data/Queries";
import { Filter, SortKey } from "@/Slices/Parameters/Core/Types";
import {
  EmptyView,
  PageContainer,
  LoadingView,
  PaginationWidget,
  ErrorView,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { ParametersTable } from "./ParametersTable";
import { ParametersTablePresenter } from "./ParametersTablePresenter";
import { TableControls } from "./TableControls";

/**
 * Page component for the Parameters View
 *
 * @returns {React.FC} A React component that displays a list of parameters
 */
export const Page: React.FC = () => {
  const { currentPage, setCurrentPage, pageSize, setPageSize, sort, setSort, filter, setFilter } =
    usePaginatedTable<Filter, SortKey>({
      route: "Parameters",
      defaultSort: { name: "name", order: "asc" },
      filterKeys: { updated: "DateRange" },
    });

  const { data, isError, error, isSuccess, refetch } = useGetParameters({
    filter,
    pageSize,
    sort,
    currentPage,
  }).useContinuous();

  if (isError) {
    return (
      <PageContainer pageTitle={words("parameters.title")}>
        <ErrorView message={error.message} ariaLabel="ParametersView-Error" retry={refetch} />
      </PageContainer>
    );
  }

  if (isSuccess) {
    return (
      <PageContainer pageTitle={words("parameters.title")}>
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
          <EmptyView
            message={words("parameters.empty.message")}
            aria-label="ParametersView-Empty"
          />
        ) : (
          <ParametersTable
            rows={data.data}
            aria-label="ParametersView-Success"
            tablePresenter={new ParametersTablePresenter()}
            sort={sort}
            setSort={setSort}
          />
        )}
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle={words("parameters.title")}>
      <LoadingView ariaLabel="ParametersView-Loading" />
    </PageContainer>
  );
};
