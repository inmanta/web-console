import React, { useContext } from "react";
import { RemoteData } from "@/Core";
import {
  RequiresTable,
  LoadingRequiresTable,
  ErrorView,
} from "@/UI/Components";
import { EmptyView } from "@/UI/Components/EmptyView";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  id: string;
  deps: number;
}

export const RequiresTableWithData: React.FC<Props> = ({ id, deps }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useContinuous<"GetResourceDetails">({
    kind: "GetResourceDetails",
    id,
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <LoadingRequiresTable
          numberOfRows={deps}
          aria-label="ResourceRequires-Loading"
        />
      ),
      failed: (error) => (
        <ErrorView
          message={words("error.general")(error)}
          aria-label="ResourceRequires-Failed"
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
    data,
  );
};
