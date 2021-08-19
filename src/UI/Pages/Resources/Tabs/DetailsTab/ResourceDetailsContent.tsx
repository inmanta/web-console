import { getUrl } from "@/UI/Routing";
import { words } from "@/UI/words";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { HistoryIcon } from "@patternfly/react-icons";
import React from "react";
import { Link } from "react-router-dom";

interface Props {
  id: string;
  lastDeploy: string;
  firstGeneratedTime: string;
  versionLink: React.ReactElement;
}

export const ResourceDetailsContent: React.FC<Props> = ({
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
              {words("resources.details.id")}
            </DescriptionListTerm>
            <DescriptionListDescription>{id}</DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>
              {words("resources.details.lastDeploy")}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {lastDeploy}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>
              {words("resources.details.firstTime")}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {firstGeneratedTime}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <Link
              to={{
                pathname: getUrl("ResourceHistory", {
                  resourceId: id,
                }),
                search: location.search,
              }}
            >
              <Button isBlock>
                <HistoryIcon /> {words("inventory.statusTab.history")}
              </Button>
            </Link>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
      <CardFooter>{versionLink}</CardFooter>
    </Card>
  );
};
