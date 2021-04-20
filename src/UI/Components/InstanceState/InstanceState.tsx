import React from "react";
import { State } from "@/Core";
import { Label, LabelProps } from "@patternfly/react-core";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
} from "@patternfly/react-icons";

export const InstanceState: React.FC<State> = ({ name, label }) => {
  const visual = getVisual(label);
  if (visual === null)
    return <span aria-label={`InstanceState-${name}`}>{name}</span>;

  return (
    <Label {...visual} aria-label={`InstanceState-${name}`}>
      {name}
    </Label>
  );
};

function getVisual(
  label: State["label"]
): { icon: React.ReactNode; color: LabelProps["color"] } | null {
  switch (label) {
    case "danger":
      return { icon: <ExclamationCircleIcon />, color: "red" };
    case "warning":
      return { icon: <ExclamationTriangleIcon />, color: "orange" };
    case "success":
      return { icon: <CheckCircleIcon />, color: "green" };
    case "info":
      return { icon: <InfoCircleIcon />, color: "blue" };
    default:
      return null;
  }
}
