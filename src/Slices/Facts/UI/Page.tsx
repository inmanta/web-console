import React, { useCallback, useMemo, useState } from "react";
import { Drawer, DrawerContent, DrawerContentBody, Stack, StackItem } from "@patternfly/react-core";
import { usePaginatedTable } from "@/Data";
import { useGetFacts } from "@/Data/Queries";
import { Filter, SortKey } from "@/Slices/Facts/Core/Types";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PageContainer,
  PaginationWidget,
  countActiveFilters,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { FactsTable } from "./FactsTable";
import { FactsTablePresenter } from "./FactsTablePresenter";
import { ConnectedFilterWidget } from "./FilterWidget";
import { TableControls } from "./TableControls";

/**
 * Page component for the Facts View.
 *
 * @returns {React.FC} A React component that displays a list of facts
 */
export const Page: React.FC = () => {
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const { currentPage, setCurrentPage, pageSize, setPageSize, filter, sort, setSort } =
    usePaginatedTable<Filter, SortKey>({
      route: "Facts",
      defaultSort: { name: "name", order: "asc" },
    });

  const activeFilterCount = useMemo(() => countActiveFilters(filter), [filter]);

  const onCloseFilterWidget = useCallback(() => {
    setIsDrawerExpanded(false);
  }, []);

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
      <PageContainer
        pageTitle={words("facts.title")}
        style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}
      >
        <TableControls
          paginationWidget={
            <PaginationWidget
              data={data}
              pageSize={pageSize}
              setPageSize={setPageSize}
              setCurrentPage={setCurrentPage}
            />
          }
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
                <EmptyView message={words("facts.empty.message")} aria-label="FactsView-Empty" />
              ) : (
                <Stack hasGutter style={{ flex: "1 1 auto", minHeight: 0, height: "100%" }}>
                  <StackItem isFilled style={{ minHeight: 0, height: "100%", overflow: "auto" }}>
                    <FactsTable
                      aria-label="Facts-Success"
                      rows={tablePresenter.createRows(data.data)}
                      tablePresenter={tablePresenter}
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
    <PageContainer pageTitle={words("facts.title")}>
      <LoadingView ariaLabel="Facts-Loading" />
    </PageContainer>
  );
};
