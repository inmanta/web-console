import React, { useContext } from "react";

import { RemoteData } from "@/Core";
import { useUrlStateWithFilter, useUrlStateWithPageSize } from "@/Data";
import { PageContainer, PaginationWidget } from "@/UI/Components";
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
      {RemoteData.fold(
        {
          notAsked: () => null,
          loading: () => null,
          failed: () => null,
          success: ({ data }) => <List {...{ data }} onUpdate={retry} />,
        },
        data
      )}
    </PageContainer>
  );
};
