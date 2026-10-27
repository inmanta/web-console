import React from "react";
import { words } from "@/Core";
import { usePaginatedTable } from "@/Data/Common";
import { NotificationFilter, useGetNotifications } from "@/Data/Queries/Slices/Notification";
import { EmptyView } from "@/UI/Components/EmptyView";
import { ErrorView } from "@/UI/Components/ErrorView";
import { LoadingView } from "@/UI/Components/LoadingView";
import { PageContainer } from "@/UI/Components/PageContainer";
import { PaginationWidget } from "@/UI/Components/PaginationWidget";
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
          <EmptyView message={words("notification.center.empty")} />
        ) : (
          <List {...{ data: data.data }} onUpdate={refetch} />
        )}
      </PageContainer>
    );
  }

  return <LoadingView />;
};
