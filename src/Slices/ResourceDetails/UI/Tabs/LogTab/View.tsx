import React, { useCallback, useMemo, useState } from "react";
import { Stack, StackItem } from "@patternfly/react-core";
import { hasAnySetValue, toggleValueInList, words } from "@inmanta/web-console-core";
import { usePaginatedTable } from "@inmanta/web-console-core/Common";
import { ResourceLogFilter } from "@inmanta/web-console-core/Domain/ResourceLog";
import { useGetResourceLogs } from "@inmanta/web-console-core/Queries/Slices/Resource";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { FilterDrawer, countActiveFilters } from "@inmanta/web-console-ui/Components/FilterDrawer";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { PaginationWidget } from "@inmanta/web-console-ui/Components/PaginationWidget";
import { ConnectedFilterWidget, Controls } from "./Controls";
import { ResourceLogsTable } from "./ResourceLogsTable";

interface Props {
  resourceId: string;
}

/**
 * The LogTab component.
 *
 * This component is responsible of displaying the logs of a resource.
 *
 * Filtering is handled in a side panel drawer: the toolbar exposes a toggle button
 * with an active filter count, and the filter form lives in the drawer panel.
 *
 * @Props {Props} - The props of the component
 *  @prop {string} resourceId - The id of the resource
 *
 * @returns {React.FC<Props>} A React Component displaying the logs of a resource
 */
export const View: React.FC<Props> = ({ resourceId }) => {
  const { currentPage, setCurrentPage, pageSize, setPageSize, sort, setSort, filter, setFilter } =
    usePaginatedTable<ResourceLogFilter>({
      route: "ResourceDetails",
      defaultSort: { name: "timestamp", order: "desc" },
      filterKeys: { timestamp: "DateRange" },
    });

  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);

  const onCloseFilterWidget = useCallback(() => {
    setIsDrawerExpanded(false);
  }, []);

  const activeFilterCount = useMemo(() => countActiveFilters(filter), [filter]);
  const onResetFilters = hasAnySetValue(filter) ? () => setFilter({}) : undefined;

  const { data, isSuccess, isError, error, refetch } = useGetResourceLogs({
    id: resourceId,
    pageSize,
    filter,
    sort,
    currentPage,
  }).useContinuous();

  const toggleActionType = (action: string) => {
    const list = toggleValueInList(action, filter.action || []);

    setFilter({
      ...filter,
      action: list.length <= 0 ? undefined : list,
    });
  };

  if (isError) {
    return <ErrorView message={error.message} ariaLabel="ResourceLogs-Error" retry={refetch} />;
  }

  if (isSuccess) {
    return (
      <>
        <Controls
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
              message={words("resources.logs.empty.message")}
              aria-label="ResourceLogs-Empty"
              onResetFilters={onResetFilters}
            />
          ) : (
            <Stack style={{ flex: "1 1 auto", minHeight: 0, height: "100%" }}>
              <StackItem isFilled style={{ minHeight: 0, height: "100%", overflow: "auto" }}>
                <ResourceLogsTable
                  logs={data.data}
                  toggleActionType={toggleActionType}
                  sort={sort}
                  setSort={setSort}
                />
              </StackItem>
            </Stack>
          )}
        </FilterDrawer>
      </>
    );
  }

  return <LoadingView ariaLabel="ResourceLogs-Loading" />;
};
