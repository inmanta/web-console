import React, { useContext } from "react";
import { toggleValueInList } from "@/Core";
import {
  useUrlStateWithFilter,
  useUrlStateWithPageSize,
  useUrlStateWithSort,
} from "@/Data";
import { EmptyView, PaginationWidget, RemoteDataView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ResourceLogFilter } from "@S/ResourceDetails/Core/ResourceLog";
import { Controls } from "./Controls";
import { ResourceLogsTable } from "./ResourceLogsTable";

interface Props {
  resourceId: string;
}

export const View: React.FC<Props> = ({ resourceId }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "ResourceDetails",
  });
  const [sort, setSort] = useUrlStateWithSort<string>({
    default: { name: "timestamp", order: "desc" },
    route: "ResourceDetails",
  });
  const [filter, setFilter] = useUrlStateWithFilter<ResourceLogFilter>({
    route: "ResourceDetails",
    keys: { timestamp: "DateRange" },
  });
  const [data, retry] = queryResolver.useContinuous<"GetResourceLogs">({
    kind: "GetResourceLogs",
    id: resourceId,
    pageSize,
    filter,
    sort,
  });

  const toggleActionType = (action: string) => {
    const list = toggleValueInList(action, filter.action || []);

    setFilter({
      ...filter,
      action: list.length <= 0 ? undefined : list,
    });
  };

  return (
    <>
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
        retry={retry}
        label="ResourceLogs"
        SuccessView={(response) => {
          if (response.data.length <= 0) {
            return (
              <EmptyView
                message={words("resources.logs.empty.message")}
                aria-label="ResourceLogs-Empty"
              />
            );
          }
          return (
            <ResourceLogsTable
              logs={response.data}
              toggleActionType={toggleActionType}
              sort={sort}
              setSort={setSort}
            />
          );
        }}
      />
    </>
  );
};
