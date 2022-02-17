import React, { useContext } from "react";
import { EmptyView } from "@/UI/Components/EmptyView";
import { RemoteDataView } from "@/UI/Components/RemoteDataView";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { RequiresTable } from "./RequiresTable";

interface Props {
  id: string;
}

export const RequiresTableWithData: React.FC<Props> = ({ id }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useContinuous<"GetResourceDetails">({
    kind: "GetResourceDetails",
    id,
  });

  return (
    <RemoteDataView
      data={data}
      label="ResourceRequires"
      SuccessView={(resourceDetails) =>
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
        )
      }
    />
  );
};
