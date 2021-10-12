import { words } from "@/UI/words";
import {
  Card,
  CardBody,
  CardFooter,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import React from "react";

interface Props {
  id: string;
  lastDeploy: string;
  firstGeneratedTime: string;
  versionLink: React.ReactElement;
}

export const ResourceInfoContent: React.FC<Props> = ({
  id,
  lastDeploy,
  firstGeneratedTime,
  versionLink,
}) => {
  return (
    <Card>
      <CardBody>
        <DescriptionList isHorizontal>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {words("resources.info.id")}
            </DescriptionListTerm>
            <DescriptionListDescription>{id}</DescriptionListDescription>
          </DescriptionListGroup>

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
      <CardFooter>{versionLink}</CardFooter>
    </Card>
  );
};
