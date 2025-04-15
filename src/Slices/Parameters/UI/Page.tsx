import React, { useEffect } from "react";
import { useUrlStateWithFilter, useUrlStateWithPageSize, useUrlStateWithSort } from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { useGetParameters } from "@/Data/Managers/V2/Miscellaneous/GetParameters/useGetParameters";
import {
  EmptyView,
  PageContainer,
  LoadingView,
  PaginationWidget,
  ErrorView,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { Filter, SortKey } from "@S/Parameters/Core/Query";
import { ParametersTable } from "./ParametersTable";
import { ParametersTablePresenter } from "./ParametersTablePresenter";
import { TableControls } from "./TableControls";

export const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({
    route: "Parameters",
  });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "Parameters",
  });
  const [filter, setFilter] = useUrlStateWithFilter<Filter>({
    route: "Parameters",
    keys: { updated: "DateRange" },
  });
  const [sort, setSort] = useUrlStateWithSort<SortKey>({
    default: { name: "name", order: "asc" },
    route: "Parameters",
  });

  const { data, isError, error, isSuccess, refetch } = useGetParameters({
    filter,
    pageSize,
    sort,
    currentPage,
  }).useContinuous();

  //when sorting is triggered, reset the current page
  useEffect(() => {
    setCurrentPage({ kind: "CurrentPage", value: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort.order]);

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
