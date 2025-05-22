import React from "react";
import { useGetResourceFacts } from "@/Data/Queries/V2/Resource";
import { ErrorView, LoadingView } from "@/UI/Components";
import { FactsTable } from "./FactsTable";

interface Props {
  resourceId: string;
}

/**
 * The FactsTab component.
 *
 * This component is responsible of displaying the facts of a resource.
 *
 * @Props {Props} - The props of the component
 *  @prop {string} resourceId - The id of the resource
 *
 * @returns {React.FC<Props>} A React Component displaying the facts of a resource
 */
export const FactsTab: React.FC<Props> = ({ resourceId }) => {
  const { data, isSuccess, isError, error, refetch } =
    useGetResourceFacts().useContinuous(resourceId);

  if (isError) {
    return <ErrorView message={error.message} retry={refetch} ariaLabel="Facts-Error" />;
  }

  if (isSuccess) {
    return <FactsTable facts={data} />;
  }

  return <LoadingView ariaLabel="Facts-Loading" />;
};
