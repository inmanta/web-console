import { RemoteData, resourceIdToDetails } from "@/Core";
import { EmptyView, ErrorView, LoadingView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import React, { useContext } from "react";
import { ResourceActionsTable } from "./ResourceActionsTable";

interface Props {
  resourceId: string;
}

export const View: React.FC<Props> = ({ resourceId }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [data, retry] = queryResolver.useContinuous<"ResourceActions">({
    kind: "ResourceActions",
    ...resourceIdToDetails(resourceId),
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView aria-label="ResourceActions-Loading" />,
      failed: (error) => (
        <ErrorView
          retry={retry}
          title={words("resources.actions.failed.title")}
          message={words("resources.actions.failed.body")(error)}
          aria-label="ResourceHistory-Failed"
        />
      ),
      success: (response) => {
        if (response.data.length <= 0) {
          return (
            <EmptyView
              message={words("resources.actions.empty.message")}
              aria-label="ResourceActions-Empty"
            />
          );
        }
        return (
          <ResourceActionsTable
            aria-label="ResourceHistory-Success"
            actions={response.data}
          />
        );
      },
    },
    data
  );
};
