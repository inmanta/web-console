import React, { useCallback, useMemo, useState } from "react";
import { Drawer, DrawerContent, DrawerContentBody, Stack, StackItem } from "@patternfly/react-core";
import { toggleValueInList } from "@/Core";
import { usePaginatedTable } from "@/Data";
import { useGetResourceLogs } from "@/Data/Queries";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PaginationWidget,
  countActiveFilters,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { ResourceLogFilter } from "@S/ResourceDetails/Core/ResourceLog";
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
        <Drawer
          isExpanded={isDrawerExpanded}
          isInline
          style={{ display: "flex", flexDirection: "column", flex: "1 1 auto" }}
        >
          <DrawerContent panelContent={<ConnectedFilterWidget onClose={onCloseFilterWidget} />}>
            <DrawerContentBody
              style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}
            >
              {data.data.length <= 0 ? (
                <EmptyView
                  message={words("resources.logs.empty.message")}
                  aria-label="ResourceLogs-Empty"
                />
              ) : (
                <Stack hasGutter style={{ flex: "1 1 auto", minHeight: 0, height: "100%" }}>
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
            </DrawerContentBody>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return <LoadingView ariaLabel="ResourceLogs-Loading" />;
};
