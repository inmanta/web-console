import { getUrl } from "@/UI/Routing";
import { words } from "@/UI/words";
import {
  ActionList,
  ActionListItem,
  Button,
  Card,
  CardBody,
  CardFooter,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { HistoryIcon, ListIcon } from "@patternfly/react-icons";
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
            <Actions resourceId={id} />
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
      <CardFooter>{versionLink}</CardFooter>
    </Card>
  );
};

const Actions: React.FC<{ resourceId: string }> = ({ resourceId }) => (
  <ActionList>
    <ActionListItem>
      <Link
        to={{
          pathname: getUrl("ResourceHistory", { resourceId }),
          search: location.search,
        }}
      >
        <Button isBlock variant="primary">
          <HistoryIcon /> {words("resources.history.linkTitle")}
        </Button>
      </Link>
    </ActionListItem>
    <ActionListItem>
      <Link
        to={{
          pathname: getUrl("ResourceActions", { resourceId }),
          search: location.search,
        }}
      >
        <Button isBlock variant="tertiary">
          <ListIcon /> {words("resources.actions.linkTitle")}
        </Button>
      </Link>
    </ActionListItem>
  </ActionList>
);
