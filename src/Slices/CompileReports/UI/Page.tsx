import React, { useCallback, useMemo, useState } from "react";
import { Drawer, DrawerContent, DrawerContentBody, Stack, StackItem } from "@patternfly/react-core";
import { usePaginatedTable } from "@/Data";
import { useGetCompileReports } from "@/Data/Queries";
import { Filter } from "@/Slices/CompileReports/Core/Types";
import {
  EmptyView,
  PageContainer,
  ErrorView,
  PaginationWidget,
  LoadingView,
  countActiveFilters,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { CompileReportsTableControls } from "./CompileReportsTableControls";
import { ConnectedFilterWidget } from "./FilterWidget";
import { TableProvider } from "./TableProvider";

export const Page: React.FC = () => {
  const { currentPage, setCurrentPage, pageSize, setPageSize, filter, sort, setSort } =
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
        style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}
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
        <Drawer
          isExpanded={isDrawerExpanded}
          isInline
          style={{ display: "flex", flexDirection: "column", flex: "1 1 auto" }}
        >
          <DrawerContent panelContent={<ConnectedFilterWidget onClose={onCloseFilterWidget} />}>
            <DrawerContentBody
              style={{
                display: "flex",
                flexDirection: "column",
                flex: "1 1 auto",
                minHeight: 0,
              }}
            >
              {data.data.length <= 0 ? (
                <EmptyView
                  message={words("compileReports.empty.message")}
                  aria-label="CompileReportsView-Empty"
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
            </DrawerContentBody>
          </DrawerContent>
        </Drawer>
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle={words("compileReports.title")}>
      <LoadingView ariaLabel="CompileReportsView-Loading" />
    </PageContainer>
  );
};
