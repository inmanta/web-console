import React, { useContext } from "react";
import { useUrlStateWithFilter, useUrlStateWithPageSize } from "@/Data";
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
  });

  return (
    <PageContainer title={words("notification.center.title")}>
      <Controls
        paginationWidget={
          <PaginationWidget
            data={data}
            pageSize={pageSize}
            setPageSize={setPageSize}
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
