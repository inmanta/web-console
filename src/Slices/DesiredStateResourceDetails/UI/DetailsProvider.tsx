import React from "react";
import { ErrorView, LoadingView } from "@/UI/Components";
import { Details } from "./Details";
import {
  useGetDesiredStateResourceDetails,
  useGetVersionResources,
} from "@/Data/Managers/V2/DesiredState";

interface Props {
  version: string;
  resourceId: string;
}

export const DetailsProvider: React.FC<Props> = ({
  version,
  resourceId: id,
}) => {
  const { data, isSuccess, isError, error, refetch } =
    useGetDesiredStateResourceDetails(version, id).useContinuous();

  if (isError) {
    return (
      <ErrorView
        ariaLabel="ResourceDetails-Error"
        message={error.message}
        retry={refetch}
      />
    );
  }

  if (isSuccess) {
    return <Details details={data} aria-label="ResourceDetails-Success" />;
  }

  return <LoadingView ariaLabel="ResourceDetails-Loading" />;
};
