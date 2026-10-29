import React from "react";
import { useGetCompileDetails } from "@inmanta/web-console-core/Queries/Slices/Compilation";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { CompileDetailsSections } from "./CompileDetailsSections";

interface Props {
  id: string;
}

export const CompileDetails: React.FC<Props> = ({ id }) => {
  const { data, isSuccess, isError, error, refetch } = useGetCompileDetails({
    id,
  }).useContinuous();

  if (isError) {
    return (
      <ErrorView message={error.message} retry={refetch} ariaLabel="CompileDetailsView-Error" />
    );
  }

  if (isSuccess) {
    return (
      <CompileDetailsSections compileDetails={data.data} aria-label="CompileDetailsView-Success" />
    );
  }

  return <LoadingView ariaLabel="CompileDetailsView-Loading" />;
};
