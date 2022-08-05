import React from "react";
import { Query } from "@/Core";
import { EmptyView, RemoteDataView, RequiresTable } from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  data: Query.UsedApiData<"GetResourceDetails">;
}

export const RequiresTab: React.FC<Props> = ({ data }) => {
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
