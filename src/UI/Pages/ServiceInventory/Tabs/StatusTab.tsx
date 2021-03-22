import React from "react";
import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Title,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import { words } from "@/UI";

interface StatusInfo {
  instanceId: string;
  state: React.ReactElement | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  actions: React.ReactElement | null;
}

interface Props {
  statusInfo: StatusInfo;
}

export const StatusTab: React.FC<Props> = ({ statusInfo }) => (
  <Card>
    <CardBody>
      <Flex spaceItems={{ default: "spaceItemsXl" }}>
        <Flex direction={{ default: "column" }}>
          <FlexItem>
            <Title headingLevel="h3">
              {words("inventory.statustab.details")}
            </Title>
          </FlexItem>
          <FlexItem>
            <DescriptionList isHorizontal>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  {words("inventory.column.id")}
                </DescriptionListTerm>
                <DescriptionListDescription>
                  {statusInfo.instanceId}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  {words("inventory.column.state")}
                </DescriptionListTerm>
                <DescriptionListDescription>
                  {statusInfo.state}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  {words("inventory.statustab.version")}
                </DescriptionListTerm>
                <DescriptionListDescription>
                  {statusInfo.version}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  {words("inventory.column.createdAt")}
                </DescriptionListTerm>
                <DescriptionListDescription>
                  {statusInfo.createdAt}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  {words("inventory.column.updatedAt")}
                </DescriptionListTerm>
                <DescriptionListDescription>
                  {statusInfo.updatedAt}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </FlexItem>
        </Flex>
        <Flex direction={{ default: "column" }}>
          <FlexItem>
            <Title headingLevel="h3">
              {words("inventory.statustab.actions")}
            </Title>
          </FlexItem>
          <FlexItem>{statusInfo.actions}</FlexItem>
        </Flex>
      </Flex>
    </CardBody>
  </Card>
);
