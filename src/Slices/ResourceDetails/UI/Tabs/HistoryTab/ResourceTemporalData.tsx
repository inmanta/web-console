import React from "react";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { words } from "@inmanta/web-console-core";
import { Details } from "@inmanta/web-console-core/Domain/Resource/Resource";
import { CustomDatePresenter } from "@inmanta/web-console-ui/Utils";

interface Props {
  details: Details;
}

const datePresenter = new CustomDatePresenter();

export const ResourceTemporalData: React.FC<Props> = ({ details }) => (
  <DescriptionList isHorizontal aria-label="ResourceTemporalData-Success">
    <DescriptionListGroup>
      <DescriptionListTerm>{words("resources.info.lastDeploy")}</DescriptionListTerm>
      <DescriptionListDescription>
        {details.last_deploy ? datePresenter.getFull(details.last_deploy) : ""}
      </DescriptionListDescription>
    </DescriptionListGroup>
    <DescriptionListGroup>
      <DescriptionListTerm>{words("created")}</DescriptionListTerm>
      <DescriptionListDescription>
        {datePresenter.getFull(details.first_generated_time)}
      </DescriptionListDescription>
    </DescriptionListGroup>
  </DescriptionList>
);
