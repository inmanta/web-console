import React, { useContext, useEffect, useState } from "react";
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
import { Environment, ParsedNumber } from "@/Core";
import { DependencyContext } from "@/UI";
import { TextWithCopy } from "@/UI/Components";
import { CustomEvent } from "@/UI/Components/ExpertBanner";
import { words } from "@/UI/words";

interface StatusInfo {
  instanceId: string;
  state: React.ReactElement | null;
  version: ParsedNumber;
  createdAt: string;
  updatedAt: string;
  actions: React.ReactElement | null;
  expertActions: React.ReactElement | null;
}

interface Props {
  statusInfo: StatusInfo;
}

export const StatusTab: React.FC<Props> = ({ statusInfo }) => {
  const { environmentHandler } = useContext(DependencyContext);
  const environment = environmentHandler.useSelected() as
    | Environment
    | undefined;
  const [areExpertVisible, setAreExpertVisible] = useState(
    environment?.settings.enable_lsm_expert_mode ? true : false
  );
  useEffect(() => {
    document.addEventListener("expert-mode-check", (evt: CustomEvent) => {
      setAreExpertVisible(evt.detail === true);
    });
    return () =>
      document.removeEventListener("expert-mode-check", (evt: CustomEvent) => {
        setAreExpertVisible(evt.detail === true);
      });
  }, []);
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
          <Flex direction={{ default: "column" }}>
            <FlexItem>
              <Title headingLevel="h3">
                {words("inventory.statustab.actions")}
              </Title>
            </FlexItem>
            <FlexItem>{statusInfo.actions}</FlexItem>
          </Flex>
          {areExpertVisible && (
            <Flex direction={{ default: "column" }}>
              <FlexItem>
                <Title headingLevel="h3">
                  {words("inventory.statustab.expertActions")}
                </Title>
              </FlexItem>
              <FlexItem>{statusInfo.expertActions}</FlexItem>
            </Flex>
          )}
        </Flex>
      </CardBody>
    </Card>
  );
};
