import React from "react";
import { useUrlStateWithFilter, useUrlStateWithPageSize } from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import {
  NotificationFilter,
  useGetNotifications,
} from "@/Data/Queries";
import {
  EmptyView,
  PageContainer,
  PaginationWidget,
  LoadingView,
  ErrorView,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { Controls } from "./Controls";
import { List } from "./List";
export const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({
    route: "NotificationCenter",
  });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "NotificationCenter",
  });
  const [filter, setFilter] = useUrlStateWithFilter<NotificationFilter>({
    route: "NotificationCenter",
    keys: { read: "Boolean" },
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
