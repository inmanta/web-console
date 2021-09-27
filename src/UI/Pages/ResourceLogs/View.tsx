import {
  PageSize,
  RemoteData,
  ResourceLogFilter,
  toggleValueInList,
} from "@/Core";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PaginationWidget,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import React, { useContext, useState } from "react";
import styled from "styled-components";
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
      loading: () => <Filler />,
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
                toggleActionType={toggleActionType}
              />
            );
          },
        },
        data
      )}
    </>
  );
};

const Filler = styled.div`
  height: 36px;
  width: 100px;
`;
