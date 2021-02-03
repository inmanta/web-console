import { State } from "@/Core";
import { Label } from "@patternfly/react-core";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
} from "@patternfly/react-icons";
import React from "react";

export const InstanceState: React.FC<State> = ({ name, label }) => {
  return getIcon(name, label);
};

function getIcon(
  name: string,
  label?: "danger" | "warning" | "success" | "info"
) {
  switch (label) {
    case "danger":
      return (
        <Label icon={<ExclamationCircleIcon />} color={"red"}>
          {name}
        </Label>
      );
    case "warning":
      return (
        <Label icon={<ExclamationTriangleIcon />} color={"orange"}>
          {name}
        </Label>
      );
    case "success":
      return (
        <Label icon={<CheckCircleIcon />} color={"green"}>
          {name}
        </Label>
      );
    case "info":
    default:
      return (
        <Label icon={<InfoCircleIcon />} color={"blue"}>
          {name}
        </Label>
      );
  }
}
