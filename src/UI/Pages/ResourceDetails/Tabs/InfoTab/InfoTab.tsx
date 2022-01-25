import React, { useContext } from "react";
import { RemoteDataView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { MomentDatePresenter } from "@/UI/Utils";
import { ResourceInfoContent } from "../HistoryTab/ResourceInfoContent";

interface Props {
  id: string;
}

export const InfoTab: React.FC<Props> = ({ id }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useContinuous<"GetResourceDetails">({
    kind: "GetResourceDetails",
    id,
  });
  const datePresenter = new MomentDatePresenter();

  return (
    <RemoteDataView
      data={data}
      label="ResourceDetails"
      SuccessView={(resourceDetails) => (
        <ResourceInfoContent
          lastDeploy={
            resourceDetails.last_deploy
              ? datePresenter.getFull(resourceDetails.last_deploy)
              : ""
          }
          firstGeneratedTime={datePresenter.getFull(
            resourceDetails.first_generated_time
          )}
          aria-label="ResourceDetails-Success"
        />
      )}
    />
  );
};
