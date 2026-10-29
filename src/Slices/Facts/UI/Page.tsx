import React, { useCallback, useMemo, useState } from "react";
import { Stack, StackItem } from "@patternfly/react-core";
import { hasAnySetValue, words } from "@inmanta/web-console-core";
import { usePaginatedTable } from "@inmanta/web-console-core/Common";
import { Filter, SortKey } from "@inmanta/web-console-core/Domain/FactFilter";
import { useGetFacts } from "@inmanta/web-console-core/Queries/Slices/Facts";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { FilterDrawer, countActiveFilters } from "@inmanta/web-console-ui/Components/FilterDrawer";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { PageContainer } from "@inmanta/web-console-ui/Components/PageContainer";
import { PaginationWidget } from "@inmanta/web-console-ui/Components/PaginationWidget";
import { FactsTable } from "./FactsTable";
import { createFactsTablePresenter } from "./FactsTablePresenter";
import { ConnectedFilterWidget } from "./FilterWidget";
import { TableControls } from "./TableControls";

/**
 * Page component for the Facts View.
 *
 * @returns {React.FC} A React component that displays a list of facts
 */
export const Page: React.FC = () => {
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const { currentPage, setCurrentPage, pageSize, setPageSize, filter, setFilter, sort, setSort } =
    usePaginatedTable<Filter, SortKey>({
      route: "Facts",
      defaultSort: { name: "name", order: "asc" },
    });

  const activeFilterCount = useMemo(() => countActiveFilters(filter), [filter]);
  const onResetFilters = hasAnySetValue(filter) ? () => setFilter({}) : undefined;

  const onCloseFilterWidget = useCallback(() => {
    setIsDrawerExpanded(false);
  }, []);

  const { data, isSuccess, isError, error, refetch } = useGetFacts({
    pageSize,
    filter,
    sort,
    currentPage,
  }).useContinuous();

  const tablePresenter = createFactsTablePresenter();

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
        style={{ display: "flex", flexDirection: "column" }}
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
        <FilterDrawer
          isExpanded={isDrawerExpanded}
          panelContent={<ConnectedFilterWidget onClose={onCloseFilterWidget} />}
        >
          {data.data.length <= 0 ? (
            <EmptyView
              message={words("facts.empty.message")}
              aria-label="FactsView-Empty"
              onResetFilters={onResetFilters}
            />
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
        </FilterDrawer>
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle={words("facts.title")}>
      <LoadingView ariaLabel="Facts-Loading" />
    </PageContainer>
  );
};
