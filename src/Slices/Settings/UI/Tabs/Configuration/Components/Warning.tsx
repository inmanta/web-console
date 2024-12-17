import React from "react";
import { Icon, Tooltip } from "@patternfly/react-core";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";

export const Warning: React.FC = () => (
  <Icon status="warning" data-testid="Warning" isInline>
    <Tooltip content="Changed value has not been saved">
      <ExclamationTriangleIcon />
    </Tooltip>
  </Icon>
);
