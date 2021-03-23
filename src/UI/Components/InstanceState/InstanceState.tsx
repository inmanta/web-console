import React from "react";
import { State } from "@/Core";
import { Label } from "@patternfly/react-core";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
} from "@patternfly/react-icons";

export const InstanceState: React.FC<State> = ({ name, label }) => {
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
      return (
        <Label icon={<InfoCircleIcon />} color={"blue"}>
          {name}
        </Label>
      );
    default:
      return <>{name}</>;
  }
};
