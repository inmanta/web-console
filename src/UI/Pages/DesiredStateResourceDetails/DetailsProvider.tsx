import React, { useContext } from "react";
import { RemoteDataView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { Details } from "./Details";

interface Props {
  version: string;
  resourceId: string;
}

export const DetailsProvider: React.FC<Props> = ({
  version,
  resourceId: id,
}) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useContinuous<"GetVersionedResourceDetails">({
    kind: "GetVersionedResourceDetails",
    version,
    id,
  });

  return (
    <RemoteDataView
      data={data}
      label="ResourceDetails"
      SuccessView={(details) => (
        <Details details={details} aria-label="ResourceDetails-Success" />
      )}
    />
  );
};
