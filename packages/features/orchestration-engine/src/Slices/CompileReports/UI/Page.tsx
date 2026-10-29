import React, { useCallback, useMemo, useState } from "react";
import { Stack, StackItem } from "@patternfly/react-core";
import { hasAnySetValue, words } from "@inmanta/web-console-core";
import { usePaginatedTable } from "@inmanta/web-console-core/Common";
import { Filter } from "@inmanta/web-console-core/Domain/CompileReportFilter";
import { useGetCompileReports } from "@inmanta/web-console-core/Queries/Slices/Compilation";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { FilterDrawer, countActiveFilters } from "@inmanta/web-console-ui/Components/FilterDrawer";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { PageContainer } from "@inmanta/web-console-ui/Components/PageContainer";
import { PaginationWidget } from "@inmanta/web-console-ui/Components/PaginationWidget";
import { CompileReportsTableControls } from "./CompileReportsTableControls";
import { ConnectedFilterWidget } from "./FilterWidget";
import { TableProvider } from "./TableProvider";

export const Page: React.FC = () => {
  const { currentPage, setCurrentPage, pageSize, setPageSize, filter, setFilter, sort, setSort } =
    usePaginatedTable<Filter>({
      route: "CompileReports",
      defaultSort: { name: "requested", order: "desc" },
      filterKeys: { requested: "DateRange", success: "Boolean" },
    });

  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);

  const onCloseFilterWidget = useCallback(() => {
    setIsDrawerExpanded(false);
  }, []);

  const activeFilterCount = useMemo(() => countActiveFilters(filter), [filter]);
  const onResetFilters = hasAnySetValue(filter) ? () => setFilter({}) : undefined;

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
      <PageContainer
        pageTitle={words("compileReports.title")}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <CompileReportsTableControls
          paginationWidget={
            <PaginationWidget
              data={data}
              pageSize={pageSize}
              setPageSize={setPageSize}
              setCurrentPage={setCurrentPage}
            />
          }
          afterRecompile={() => refetch()}
          onToggleFilters={() => setIsDrawerExpanded((prev) => !prev)}
          isDrawerExpanded={isDrawerExpanded}
          activeFilterCount={activeFilterCount}
        />
        <FilterDrawer
          isExpanded={isDrawerExpanded}
          panelContent={<ConnectedFilterWidget onClose={onCloseFilterWidget} />}
        >
          {data.data.length <= 0 ? (
            <EmptyView
              message={words("compileReports.empty.message")}
              aria-label="CompileReportsView-Empty"
              onResetFilters={onResetFilters}
            />
          ) : (
            <Stack hasGutter style={{ flex: "1 1 auto", minHeight: 0, height: "100%" }}>
              <StackItem isFilled style={{ minHeight: 0, height: "100%", overflow: "auto" }}>
                <TableProvider
                  compileReports={data.data}
                  aria-label="CompileReportsView-Success"
                  sort={sort}
                  setSort={setSort}
                />
              </StackItem>
            </Stack>
          )}
        </FilterDrawer>
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle={words("compileReports.title")}>
      <LoadingView ariaLabel="CompileReportsView-Loading" />
    </PageContainer>
  );
};
