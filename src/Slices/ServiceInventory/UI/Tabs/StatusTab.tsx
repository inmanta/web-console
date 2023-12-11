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
import { ParsedNumber } from "@/Core";
import { TextWithCopy } from "@/UI/Components";
import { words } from "@/UI/words";

interface StatusInfo {
  instanceId: string;
  state: React.ReactElement | null;
  version: ParsedNumber;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  statusInfo: StatusInfo;
}

export const StatusTab: React.FC<Props> = ({ statusInfo }) => {
  return (
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
                    <TextWithCopy
                      value={statusInfo.instanceId}
                      tooltipContent={words("id.copy")}
                    />
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
                    {statusInfo.version.toString()}
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
        </Flex>
      </CardBody>
    </Card>
  );
};
