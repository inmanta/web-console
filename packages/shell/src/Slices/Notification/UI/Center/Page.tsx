import React, { useCallback, useMemo, useState } from "react";
import { hasAnySetValue, words } from "@inmanta/web-console-core";
import { usePaginatedTable } from "@inmanta/web-console-core/Common";
import {
  NotificationFilter,
  useGetNotifications,
} from "@inmanta/web-console-core/Queries/Slices/Notification";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { FilterDrawer, countActiveFilters } from "@inmanta/web-console-ui/Components/FilterDrawer";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { PageContainer } from "@inmanta/web-console-ui/Components/PageContainer";
import { PaginationWidget } from "@inmanta/web-console-ui/Components/PaginationWidget";
import { Controls } from "./Controls";
import { ConnectedFilterWidget } from "./FilterWidget";
import { List } from "./List";

/**
 * The Notification Center page.
 *
 * Filtering is handled in a side panel drawer: the toolbar exposes a toggle button
 * with an active filter count, and the filter form lives in the drawer panel.
 *
 * @returns {React.FC} The rendered Notification Center page.
 */
export const Page: React.FC = () => {
  const { currentPage, setCurrentPage, pageSize, setPageSize, filter, setFilter } =
    usePaginatedTable<NotificationFilter>({
      route: "NotificationCenter",
      filterKeys: { read: "Boolean" },
    });

  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);

  const onCloseFilterWidget = useCallback(() => {
    setIsDrawerExpanded(false);
  }, []);

  // "Unread" is stored as read: false, which countActiveFilters would skip.
  const activeFilterCount = useMemo(
    () => countActiveFilters({ ...filter, read: filter.read !== undefined }),
    [filter]
  );

  const { data, isError, isSuccess, error, refetch } = useGetNotifications({
    pageSize,
    filter,
    currentPage,
    origin: "center",
  }).useContinuous();

  if (isError) {
    return <ErrorView message={error.message} />;
  }

  if (isSuccess) {
    return (
      <PageContainer
        pageTitle={words("notification.center.title")}
        style={{ display: "flex", flexDirection: "column" }}
      >
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
              message={words("notification.center.empty")}
              onResetFilters={hasAnySetValue(filter) ? () => setFilter({}) : undefined}
            />
          ) : (
            <List {...{ data: data.data }} onUpdate={refetch} />
          )}
        </FilterDrawer>
      </PageContainer>
    );
  }

  return <LoadingView />;
};
