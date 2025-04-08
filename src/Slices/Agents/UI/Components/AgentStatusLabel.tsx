import React from "react";
import { Label } from "@patternfly/react-core";
import { AgentStatus } from "@S/Agents/Core/Domain";

export const AgentStatusLabel: React.FC<{ status: AgentStatus }> = ({ status }) => {
  switch (status) {
    case AgentStatus.up:
      return (
        <Label status="success" variant="outline">
          {status}
        </Label>
      );
    case AgentStatus.down:
      return (
        <Label status="danger" variant="outline">
          {status}
        </Label>
      );
    case AgentStatus.paused:
      return (
        <Label status="warning" variant="outline">
          {status}
        </Label>
      );
  }
};
