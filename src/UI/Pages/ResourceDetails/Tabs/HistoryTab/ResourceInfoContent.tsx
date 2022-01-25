import React from "react";
import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { words } from "@/UI/words";

interface Props {
  lastDeploy: string;
  firstGeneratedTime: string;
}

export const ResourceInfoContent: React.FC<Props> = ({
  lastDeploy,
  firstGeneratedTime,
}) => {
  return (
    <Card>
      <CardBody>
        <DescriptionList isHorizontal>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {words("resources.info.lastDeploy")}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {lastDeploy}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {words("resources.info.firstTime")}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {firstGeneratedTime}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};
