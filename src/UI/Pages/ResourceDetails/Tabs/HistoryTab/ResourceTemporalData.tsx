import React, { useContext } from "react";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import styled from "styled-components";
import { RemoteDataView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { MomentDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";

export const ResourceTemporalData: React.FC<{ id: string }> = ({ id }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useContinuous<"GetResourceDetails">({
    kind: "GetResourceDetails",
    id,
  });
  const datePresenter = new MomentDatePresenter();

  return (
    <RemoteDataView
      data={data}
      label="ResourceTemporalData"
      SuccessView={(resourceDetails) => (
        <StyledDescriptionList
          isHorizontal
          aria-label="ResourceTemporalData-Success"
        >
          <DescriptionListGroup>
            <DescriptionListTerm>
              {words("resources.info.lastDeploy")}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {resourceDetails.last_deploy
                ? datePresenter.getFull(resourceDetails.last_deploy)
                : ""}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {words("resources.info.firstTime")}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {datePresenter.getFull(resourceDetails.first_generated_time)}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </StyledDescriptionList>
      )}
    />
  );
};

const StyledDescriptionList = styled(DescriptionList)`
  padding: 24px;
`;
