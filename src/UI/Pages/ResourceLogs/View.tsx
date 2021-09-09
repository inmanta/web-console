import { PageSize, RemoteData } from "@/Core";
import { EmptyView, ErrorView, LoadingView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import React, { useContext, useState } from "react";
import { ResourceLogsTable } from "./ResourceLogsTable";

interface Props {
  resourceId: string;
}

export const View: React.FC<Props> = ({ resourceId }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [pageSize] = useState(PageSize.initial);
  const [data, retry] = queryResolver.useContinuous<"ResourceLogs">({
    kind: "ResourceLogs",
    id: resourceId,
    pageSize,
  });

  return RemoteData.fold(
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
  );
};
