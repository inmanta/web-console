import React from "react";
import { words } from "@/UI";
import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Title,
  Grid,
  GridItem,
} from "@patternfly/react-core";
import { TabProps } from "./InstanceDetails";

interface Props extends TabProps {
  statusInfo: StatusInfo;
}

interface StatusInfo {
  instanceId: string;
  state: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  actions: React.ReactElement | null;
}

export const StatusView: React.FC<Props> = ({ statusInfo }) => (
  <>
    <Wrapper>
      <Grid hasGutter>
        <GridItem span={4}>
          <Title headingLevel="h3">
            {words("inventory.statustab.details")}
          </Title>
        </GridItem>
        <GridItem span={1}>
          <Title headingLevel="h3">
            {words("inventory.statustab.actions")}
          </Title>
        </GridItem>
        <GridItem span={7}></GridItem>
        <GridItem span={4}>
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
        </GridItem>

        <GridItem span={1}>{statusInfo.actions}</GridItem>
        <GridItem span={7}></GridItem>
      </Grid>
    </Wrapper>
  </>
);

const Wrapper: React.FC = ({ children }) => (
  <Card>
    <CardBody isFilled={true}>{children}</CardBody>
  </Card>
);
