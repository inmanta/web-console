import React from "react";
import { Stack, StackItem } from "@patternfly/react-core";
import { useGetResourceFacts } from "@/Data/Queries";
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
    return (
      <Stack style={{ flex: "1 1 auto", minHeight: 0, height: "100%" }}>
        <StackItem isFilled style={{ minHeight: 0, height: "100%", overflow: "auto" }}>
          <FactsTable facts={data} />
        </StackItem>
      </Stack>
    );
  }

  return <LoadingView ariaLabel="Facts-Loading" />;
};
