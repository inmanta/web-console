import React, { useContext, useEffect } from "react";
import { useUrlStateWithFilter, useUrlStateWithPageSize } from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import {
  EmptyView,
  PageContainer,
  PaginationWidget,
  RemoteDataView,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Filter } from "@S/Notification/Core/Query";
import { Controls } from "./Controls";
import { List } from "./List";

export const Page: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);

  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({
    route: "NotificationCenter",
  });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "NotificationCenter",
  });
  const [filter, setFilter] = useUrlStateWithFilter<Filter>({
    route: "NotificationCenter",
    keys: { read: "Boolean" },
  });
  const [data, retry] = queryResolver.useContinuous<"GetNotifications">({
    kind: "GetNotifications",
    origin: "center",
    pageSize,
    filter,
    currentPage,
  });

  //when filtering is triggered, reset the current page
  useEffect(() => {
    setCurrentPage({ kind: "CurrentPage", value: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filter.cleared,
    filter.message,
    filter.read,
    filter.severity,
    filter.title,
  ]);

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
      <RemoteDataView
        data={data}
        SuccessView={({ data }) =>
          data.length <= 0 ? (
            <EmptyView message={words("notification.center.empty")} />
          ) : (
            <List {...{ data }} onUpdate={retry} />
          )
        }
      />
    </PageContainer>
  );
};
