import React from "react";
import { hasAnySetValue, words } from "@inmanta/web-console-core";
import { usePaginatedTable } from "@inmanta/web-console-core/Common";
import {
  NotificationFilter,
  useGetNotifications,
} from "@inmanta/web-console-core/Queries/Slices/Notification";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { PageContainer } from "@inmanta/web-console-ui/Components/PageContainer";
import { PaginationWidget } from "@inmanta/web-console-ui/Components/PaginationWidget";
import { Controls } from "./Controls";
import { List } from "./List";
export const Page: React.FC = () => {
  const { currentPage, setCurrentPage, pageSize, setPageSize, filter, setFilter } =
    usePaginatedTable<NotificationFilter>({
      route: "NotificationCenter",
      filterKeys: { read: "Boolean" },
    });

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
      <PageContainer pageTitle={words("notification.center.title")}>
        <Controls
          paginationWidget={
            <PaginationWidget
              data={data}
              pageSize={pageSize}
              setPageSize={setPageSize}
              setCurrentPage={setCurrentPage}
            />
          }
          filter={filter}
          setFilter={setFilter}
        />
        {data.data.length <= 0 ? (
          <EmptyView
            message={words("notification.center.empty")}
            onResetFilters={hasAnySetValue(filter) ? () => setFilter({}) : undefined}
          />
        ) : (
          <List {...{ data: data.data }} onUpdate={refetch} />
        )}
      </PageContainer>
    );
  }

  return <LoadingView />;
};
