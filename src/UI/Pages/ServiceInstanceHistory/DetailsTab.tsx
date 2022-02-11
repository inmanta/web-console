import React from "react";
import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
} from "@patternfly/react-core";
import { ParsedNumber } from "@/Core";
import { words } from "@/UI/words";

interface Props {
  info: Info;
}

interface Info {
  version: ParsedNumber;
  state: React.ReactElement | null;
  timestamp: string;
}

export const DetailsTab: React.FC<Props> = ({ info }) => (
  <Card>
    <CardBody isFilled={true}>
      <DescriptionList isHorizontal>
        {/* version */}
        <DescriptionListGroup>
          <DescriptionListTerm>
            {words("inventory.statustab.version")}
          </DescriptionListTerm>
          <DescriptionListDescription>
            {info.version.toString()}
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
