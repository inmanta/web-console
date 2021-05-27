import { InstanceSummary } from "@/Core";
import { words } from "@/UI";
import {
  DescriptionList,
  Label,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
} from "@patternfly/react-core";
import {
  CheckCircleIcon,
  CubesIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
  OutlinedCircleIcon,
} from "@patternfly/react-icons";
import React, { ReactNode } from "react";

interface Props {
  summary: InstanceSummary;
}

export const InstanceLabelSummary: React.FC<Props> = ({ summary }) => {
  return (
    <DescriptionList isHorizontal>
      {Object.entries(summary.by_label).map(([labelName, value]) => {
        return (
          <DescriptionListGroup key={labelName}>
            <DescriptionListTerm>
              {getLabelforName(labelName)}
            </DescriptionListTerm>
            <DescriptionListDescription>{value}</DescriptionListDescription>
          </DescriptionListGroup>
        );
      })}
      <DescriptionListGroup key={"total"}>
        <DescriptionListTerm>
          <Label icon={<CubesIcon />} color="cyan">
            {words("catalog.drawer.summary.total")}
          </Label>
        </DescriptionListTerm>
        <DescriptionListDescription>{summary.total}</DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
};

function getLabelforName(labelName: string): ReactNode {
  switch (labelName) {
    case "danger":
      return (
        <Label icon={<ExclamationCircleIcon />} color="red">
          {labelName}
        </Label>
      );
    case "warning":
      return (
        <Label icon={<ExclamationTriangleIcon />} color="orange">
          {labelName}
        </Label>
      );
    case "success":
      return (
        <Label icon={<CheckCircleIcon />} color="green">
          {labelName}
        </Label>
      );
    case "info":
      return (
        <Label icon={<InfoCircleIcon />} color="blue">
          {labelName}
        </Label>
      );
    default:
      return (
        <Label icon={<OutlinedCircleIcon />}>
          {words("catalog.drawer.summary.noLabel")}
        </Label>
      );
  }
}
