import React, { ReactElement } from "react";
import { Label, FlexItem, Flex, Tooltip } from "@patternfly/react-core";
import { OutlinedCircleIcon } from "@patternfly/react-icons";
import { InstanceSummary } from "@/Core";
import { words } from "@/UI/words";

interface Props {
  summary: InstanceSummary;
}

export const SummaryIcons: React.FC<Props> = ({ summary }) => {
  const nonZeroSummaryEntries = Object.entries(summary.by_label).filter(
    ([, value]) => value > 0,
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
        <Label status="danger" variant="outline">
          {value}
        </Label>
      );
    case "warning":
      return (
        <Label status="warning" variant="outline">
          {value}
        </Label>
      );
    case "success":
      return (
        <Label status="success" variant="outline">
          {value}
        </Label>
      );
    case "info":
      return (
        <Label status="info" variant="outline">
          {value}
        </Label>
      );
    default:
      return (
        <Label variant="outline" icon={<OutlinedCircleIcon />}>
          {value}
        </Label>
      );
  }
}
