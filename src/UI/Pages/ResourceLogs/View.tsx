import { PageSize, RemoteData } from "@/Core";
import { ResourceLogFilter } from "@/Core/Domain/Query";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PaginationWidget,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import React, { useContext, useState } from "react";
import { Controls } from "./Controls";
import { ResourceLogsTable } from "./ResourceLogsTable";

interface Props {
  resourceId: string;
}

export const View: React.FC<Props> = ({ resourceId }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [pageSize, setPageSize] = useState(PageSize.initial);
  const [filter, setFilter] = useState<ResourceLogFilter>({});
  const [data, retry] = queryResolver.useContinuous<"ResourceLogs">({
    kind: "ResourceLogs",
    id: resourceId,
    pageSize,
    filter,
  });

  const paginationWidget = RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => null,
      failed: () => null,
      success: ({ handlers, metadata }) => (
        <PaginationWidget
          handlers={handlers}
          metadata={metadata}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      ),
    },
    data
  );

  return (
    <>
      <Controls
        paginationWidget={paginationWidget}
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
              aria-label="ResourceHistory-Failed"
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
                aria-label="ResourceHistory-Success"
                logs={response.data}
              />
            );
          },
        },
        data
      )}
    </>
  );
};
