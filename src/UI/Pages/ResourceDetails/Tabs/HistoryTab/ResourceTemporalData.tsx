import React from "react";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import styled from "styled-components";
import { Query } from "@/Core";
import { RemoteDataView } from "@/UI/Components";
import { MomentDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";

interface Props {
  data: Query.UsedApiData<"GetResourceDetails">;
}

const datePresenter = new MomentDatePresenter();

export const ResourceTemporalData: React.FC<Props> = ({ data }) => (
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

const StyledDescriptionList = styled(DescriptionList)`
  padding: 24px;
`;
