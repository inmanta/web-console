import React from "react";
import { useGetResourceFacts } from "@/Data/Managers/V2/Resource";
import { ErrorView, LoadingView } from "@/UI/Components";
import { FactsTable } from "./FactsTable";

interface Props {
  resourceId: string;
}

export const FactsTab: React.FC<Props> = ({ resourceId }) => {
  const { data, isSuccess, isError, error, refetch } =
    useGetResourceFacts().useContinuous(resourceId);

  if (isError) {
    return (
      <ErrorView
        message={error.message}
        retry={refetch}
        aria-label="ResourceFacts-Error"
      />
    );
  }

  if (isSuccess) {
    return <FactsTable facts={data} />;
  }

  return <LoadingView aria-label="ResourceFacts-Loading" />;
};
