import React from "react";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { Details } from "@/Core/Domain/Resource";
import { MomentDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";

interface Props {
  details: Details;
}

const datePresenter = new MomentDatePresenter();

export const ResourceTemporalData: React.FC<Props> = ({ details }) => (
  <DescriptionList isHorizontal aria-label="ResourceTemporalData-Success">
    <DescriptionListGroup>
      <DescriptionListTerm>{words("resources.info.lastDeploy")}</DescriptionListTerm>
      <DescriptionListDescription>
        {details.last_deploy ? datePresenter.getFull(details.last_deploy) : ""}
      </DescriptionListDescription>
    </DescriptionListGroup>
    <DescriptionListGroup>
      <DescriptionListTerm>{words("resources.info.firstTime")}</DescriptionListTerm>
      <DescriptionListDescription>
        {datePresenter.getFull(details.first_generated_time)}
      </DescriptionListDescription>
    </DescriptionListGroup>
  </DescriptionList>
);
