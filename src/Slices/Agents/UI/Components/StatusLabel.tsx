import React from "react";
import { Label } from "@patternfly/react-core";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  PauseCircleIcon,
} from "@patternfly/react-icons";
import { AgentStatus } from "@S/Agents/Core/Domain";

export const StatusLabel: React.FC<{ status: AgentStatus }> = ({ status }) => {
  switch (status) {
    case AgentStatus.up:
      return (
        <Label color="green" icon={<CheckCircleIcon />}>
          {status}
        </Label>
      );
    case AgentStatus.down:
      return (
        <Label color="red" icon={<ExclamationCircleIcon />}>
          {status}
        </Label>
      );
    case AgentStatus.paused:
      return (
        <Label color="orange" icon={<PauseCircleIcon />}>
          {status}
        </Label>
      );
  }
};
