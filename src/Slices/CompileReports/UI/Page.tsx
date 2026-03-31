import React from "react";
import { usePaginatedTable } from "@/Data";
import { useGetCompileReports } from "@/Data/Queries";
import { Filter } from "@/Slices/CompileReports/Core/Types";
import {
  EmptyView,
  PageContainer,
  ErrorView,
  PaginationWidget,
  LoadingView,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { CompileReportsTableControls } from "./CompileReportsTableControls";
import { TableProvider } from "./TableProvider";

export const Page: React.FC = () => {
  const { currentPage, setCurrentPage, pageSize, setPageSize, filter, setFilter, sort, setSort } =
    usePaginatedTable<Filter>({
      route: "CompileReports",
      defaultSort: { name: "requested", order: "desc" },
      filterKeys: { requested: "DateRange", success: "Boolean" },
    });

  const { data, refetch, isSuccess, isError, error } = useGetCompileReports({
    filter,
    sort,
    pageSize,
    currentPage,
  }).useContinuous();

  if (isError) {
    return (
      <PageContainer pageTitle={words("compileReports.title")}>
        <ErrorView
          message={error.message}
          retry={() => refetch()}
          ariaLabel="CompileReportsView-Error"
        />
      </PageContainer>
    );
  }

  if (isSuccess) {
    return (
      <PageContainer pageTitle={words("compileReports.title")}>
        <CompileReportsTableControls
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
          afterRecompile={() => refetch()}
        />
        {data.data.length <= 0 ? (
          <EmptyView
            message={words("compileReports.empty.message")}
            aria-label="CompileReportsView-Empty"
          />
        ) : (
          <TableProvider
            compileReports={data.data}
            aria-label="CompileReportsView-Success"
            sort={sort}
            setSort={setSort}
          />
        )}
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle={words("compileReports.title")}>
      <LoadingView ariaLabel="CompileReportsView-Loading" />
    </PageContainer>
  );
};
