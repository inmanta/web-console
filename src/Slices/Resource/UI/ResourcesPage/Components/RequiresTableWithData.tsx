import React from "react";
import { useGetResourceDetails } from "@/Data/Managers/V2/Resource";
import {
  RequiresTable,
  LoadingRequiresTable,
  ErrorView,
} from "@/UI/Components";
import { EmptyView } from "@/UI/Components/EmptyView";
import { words } from "@/UI/words";

interface Props {
  id: string;
  deps: number;
}

export const RequiresTableWithData: React.FC<Props> = ({ id, deps }) => {
  const { data, isSuccess, isError, error, refetch } =
    useGetResourceDetails().useContinuous(id);

  if (isError) {
    <ErrorView
      message={words("error.general")(error?.message)}
      ariaLabel="ResourceRequires-Failed"
      retry={refetch}
    />;
  }

  if (isSuccess) {
    return (
      <>
        {Object.keys(data.requires_status).length <= 0 ? (
          <EmptyView
            message={words("resources.requires.empty.message")}
            aria-label="ResourceRequires-Empty"
          />
        ) : (
          <RequiresTable
            aria-label="ResourceRequires-Success"
            requiresStatus={data.requires_status}
          />
        )}
      </>
    );
  }

  return (
    <LoadingRequiresTable
      numberOfRows={deps}
      aria-label="ResourceRequires-Loading"
    />
  );
};
