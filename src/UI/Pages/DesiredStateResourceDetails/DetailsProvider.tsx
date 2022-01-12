import React, { useContext } from "react";
import { RemoteDataView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { Details } from "./Details";

interface Props {
  resourceId: string;
}

export const DetailsProvider: React.FC<Props> = ({ resourceId: id }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useContinuous<"GetResourceDetails">({
    kind: "GetResourceDetails",
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
