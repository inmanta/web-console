import React, { useContext } from "react";
import { RemoteData, ResourceLogFilter, toggleValueInList } from "@/Core";
import {
  useUrlStateWithFilter,
  useUrlStateWithPageSize,
  useUrlStateWithSort,
} from "@/Data";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PaginationWidget,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
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
  const [sort, setSort] = useUrlStateWithSort({
    default: { name: "timestamp", order: "desc" },
    route: "ResourceDetails",
  });
  const [filter, setFilter] = useUrlStateWithFilter<ResourceLogFilter>({
    route: "ResourceDetails",
    filters: { timestamp: "DateRange" },
  });
  const [data, retry] = queryResolver.useContinuous<"ResourceLogs">({
    kind: "ResourceLogs",
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
      {RemoteData.fold(
        {
          notAsked: () => null,
          loading: () => <LoadingView aria-label="ResourceLogs-Loading" />,
          failed: (error) => (
            <ErrorView
              retry={retry}
              title={words("resources.logs.failed.title")}
              message={words("resources.logs.failed.body")(error)}
              aria-label="ResourceLogs-Failed"
            />
          ),
          success: (response) => {
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
          },
        },
        data
      )}
    </>
  );
};
