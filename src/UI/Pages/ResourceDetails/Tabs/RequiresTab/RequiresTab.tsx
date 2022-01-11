import React, { useContext } from "react";
import { RemoteData } from "@/Core";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  RequiresTable,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  id: string;
}

export const RequiresTab: React.FC<Props> = ({ id }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useContinuous<"GetResourceDetails">({
    kind: "GetResourceDetails",
    id,
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView aria-label="ResourceRequires-Loading" />,
      failed: (error) => (
        <ErrorView
          aria-label="ResourceRequires-Failed"
          title={words("resources.requires.failed.title")}
          message={words("resources.requires.failed.body")(error)}
        />
      ),
      success: (resourceDetails) =>
        Object.keys(resourceDetails.requires_status).length <= 0 ? (
          <EmptyView
            message={words("resources.requires.empty.message")}
            aria-label="ResourceRequires-Empty"
          />
        ) : (
          <RequiresTable
            aria-label="ResourceRequires-Success"
            requiresStatus={resourceDetails.requires_status}
          />
        ),
    },
    data
  );
};
