import React from "react";
import { Icon, Tooltip } from "@patternfly/react-core";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";

export const Warning: React.FC = () => (
  <Icon status="warning" isInline>
    <Tooltip content="Changed value has not been saved">
      <ExclamationTriangleIcon data-testid="Warning" />
    </Tooltip>
  </Icon>
);
