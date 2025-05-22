import React, { useEffect } from "react";
import { useUrlStateWithFilter, useUrlStateWithPageSize, useUrlStateWithSort } from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { useGetCompileReports } from "@/Data/Queries/V2/Compilation/GetCompileReports";
import {
  EmptyView,
  PageContainer,
  ErrorView,
  PaginationWidget,
  LoadingView,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { Filter } from "@/Slices/CompileReports/Core/Types";
import { CompileReportsTableControls } from "./CompileReportsTableControls";
import { TableProvider } from "./TableProvider";

export const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({
    route: "CompileReports",
  });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "CompileReports",
  });
  const [filter, setFilter] = useUrlStateWithFilter<Filter>({
    route: "CompileReports",
    keys: { requested: "DateRange", success: "Boolean" },
  });
  const [sort, setSort] = useUrlStateWithSort<string>({
    default: { name: "requested", order: "desc" },
    route: "CompileReports",
  });
  const { data, refetch, isSuccess, isError, error } = useGetCompileReports({
    filter,
    sort,
    pageSize,
    currentPage,
  }).useContinuous();

  //when sorting is triggered, reset the current page
  useEffect(() => {
    setCurrentPage({ kind: "CurrentPage", value: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort.order]);

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
