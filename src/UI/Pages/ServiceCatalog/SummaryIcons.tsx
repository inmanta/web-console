import React, { ReactElement } from "react";
import { Label, FlexItem, Flex, Tooltip } from "@patternfly/react-core";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
  OutlinedCircleIcon,
} from "@patternfly/react-icons";
import { InstanceSummary } from "@/Core";
import { words } from "@/UI/words";

interface Props {
  summary: InstanceSummary;
}

export const SummaryIcons: React.FC<Props> = ({ summary }) => {
  const nonZeroSummaryEntries = Object.entries(summary.by_label).filter(
    ([, value]) => value > 0
  );
  return (
    <Flex aria-label="Number of instances by label">
      {nonZeroSummaryEntries.map(([labelName, value]) => (
        <FlexItem key={labelName}>
          <Tooltip
            content={
              labelName !== "no_label"
                ? labelName
                : words("catalog.summary.noLabel")
            }
            entryDelay={200}
          >
            {getLabelforName(labelName, value)}
          </Tooltip>
        </FlexItem>
      ))}
    </Flex>
  );
};

function getLabelforName(labelName: string, value: number): ReactElement {
  switch (labelName) {
    case "danger":
      return (
        <Label icon={<ExclamationCircleIcon />} color="red">
          {value}
        </Label>
      );
    case "warning":
      return (
        <Label icon={<ExclamationTriangleIcon />} color="orange">
          {value}
        </Label>
      );
    case "success":
      return (
        <Label icon={<CheckCircleIcon />} color="green">
          {value}
        </Label>
      );
    case "info":
      return (
        <Label icon={<InfoCircleIcon />} color="blue">
          {value}
        </Label>
      );
    default:
      return <Label icon={<OutlinedCircleIcon />}>{value}</Label>;
  }
}
