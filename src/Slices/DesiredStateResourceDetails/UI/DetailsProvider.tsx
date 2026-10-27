import React from "react";
import { useGetDesiredStateResourceDetails } from "@inmanta/web-console-core/Queries/Slices/DesiredState";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { Details } from "./Details";

interface Props {
  version: string;
  resourceId: string;
}

export const DetailsProvider: React.FC<Props> = ({ version, resourceId: id }) => {
  const { data, isSuccess, isError, error, refetch } = useGetDesiredStateResourceDetails(
    version,
    id
  ).useContinuous();

  if (isError) {
    return <ErrorView ariaLabel="ResourceDetails-Error" message={error.message} retry={refetch} />;
  }

  if (isSuccess) {
    return <Details details={data} aria-label="ResourceDetails-Success" />;
  }

  return <LoadingView ariaLabel="ResourceDetails-Loading" />;
};
