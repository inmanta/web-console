import React, { useCallback, useMemo, useState } from "react";
import { Stack, StackItem } from "@patternfly/react-core";
import { usePaginatedTable } from "@/Data";
import { useGetParameters } from "@/Data/Queries";
import { Filter, SortKey } from "@/Slices/Parameters/Core/Types";
import {
  EmptyView,
  FilterDrawer,
  PageContainer,
  LoadingView,
  PaginationWidget,
  ErrorView,
  countActiveFilters,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { ConnectedFilterWidget } from "./FilterWidget";
import { ParametersTable } from "./ParametersTable";
import { ParametersTablePresenter } from "./ParametersTablePresenter";
import { TableControls } from "./TableControls";

/**
 * Page component for the Parameters View
 *
 * @returns {React.FC} A React component that displays a list of parameters
 */
export const Page: React.FC = () => {
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const { currentPage, setCurrentPage, pageSize, setPageSize, sort, setSort, filter } =
    usePaginatedTable<Filter, SortKey>({
      route: "Parameters",
      defaultSort: { name: "name", order: "asc" },
      filterKeys: { updated: "DateRange" },
    });

  const activeFilterCount = useMemo(() => countActiveFilters(filter), [filter]);

  const onCloseFilterWidget = useCallback(() => {
    setIsDrawerExpanded(false);
  }, []);

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
      <PageContainer
        pageTitle={words("parameters.title")}
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
        <FilterDrawer
          isExpanded={isDrawerExpanded}
          panelContent={<ConnectedFilterWidget onClose={onCloseFilterWidget} />}
        >
          {data.data.length <= 0 ? (
            <EmptyView
              message={words("parameters.empty.message")}
              aria-label="ParametersView-Empty"
            />
          ) : (
            <Stack hasGutter style={{ flex: "1 1 auto", minHeight: 0, height: "100%" }}>
              <StackItem isFilled style={{ minHeight: 0, height: "100%", overflow: "auto" }}>
                <ParametersTable
                  rows={data.data}
                  aria-label="ParametersView-Success"
                  tablePresenter={new ParametersTablePresenter()}
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
    <PageContainer pageTitle={words("parameters.title")}>
      <LoadingView ariaLabel="ParametersView-Loading" />
    </PageContainer>
  );
};
