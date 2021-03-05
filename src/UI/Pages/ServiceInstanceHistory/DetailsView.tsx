import React from "react";
import { words } from "@/UI";
import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
} from "@patternfly/react-core";
import { TabProps } from "@/UI/ServiceInstanceDetails";

interface Props extends TabProps {
  info: Info;
}

interface Info {
  version: number;
  state: React.ReactElement | null;
  timestamp: string;
}

export const DetailsView: React.FC<Props> = ({ info }) => (
  <Card>
    <CardBody isFilled={true}>
      <DescriptionList isHorizontal>
        {/* version */}
        <DescriptionListGroup>
          <DescriptionListTerm>
            {words("inventory.statustab.version")}
          </DescriptionListTerm>
          <DescriptionListDescription>
            {info.version}
          </DescriptionListDescription>
        </DescriptionListGroup>

        {/* state */}
        <DescriptionListGroup>
          <DescriptionListTerm>
            {words("inventory.column.state")}
          </DescriptionListTerm>
          <DescriptionListDescription>{info.state}</DescriptionListDescription>
        </DescriptionListGroup>

        {/* timestamp */}
        <DescriptionListGroup>
          <DescriptionListTerm>{"timestamp"}</DescriptionListTerm>
          <DescriptionListDescription>
            {info.timestamp}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </CardBody>
  </Card>
);
