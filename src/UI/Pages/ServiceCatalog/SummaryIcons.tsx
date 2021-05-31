import { InstanceSummary } from "@/Core";
import { words } from "@/UI";
import { Label, FlexItem, Flex, Tooltip } from "@patternfly/react-core";
import {
  CheckCircleIcon,
  CubesIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
  OutlinedCircleIcon,
} from "@patternfly/react-icons";
import React, { ReactElement } from "react";

interface Props {
  summary: InstanceSummary;
}

export const SummaryIcons: React.FC<Props> = ({ summary }) => {
  return (
    <Flex aria-label="Number of instances by label">
      {Object.entries(summary.by_label).map(([labelName, value]) => (
        <FlexItem key={labelName}>
          <Tooltip
            content={
              labelName !== "no_label"
                ? labelName
                : words("catalog.drawer.summary.noLabel")
            }
            entryDelay={200}
          >
            {getLabelforName(labelName, value)}
          </Tooltip>
        </FlexItem>
      ))}
      <FlexItem key={words("catalog.drawer.summary.total")}>
        <Tooltip
          content={words("catalog.drawer.summary.total")}
          entryDelay={200}
        >
          <Label icon={<CubesIcon />} color="cyan">
            {summary.total}
          </Label>
        </Tooltip>
      </FlexItem>
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
