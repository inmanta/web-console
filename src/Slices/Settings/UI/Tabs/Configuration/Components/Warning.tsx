import React from "react";
import { Icon, Tooltip } from "@patternfly/react-core";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";
import { global_warning_color_100 } from "@patternfly/react-tokens";
import styled from "styled-components";

export const Warning: React.FC<{ className?: string }> = ({ className }) => (
  <Tooltip content="Changed value has not been saved">
    <IconWrapper className={className} aria-label="Warning">
      <Icon style={{ color: global_warning_color_100.var }}>
        <ExclamationTriangleIcon />
      </Icon>
    </IconWrapper>
  </Tooltip>
);

const IconWrapper = styled.span`
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  vertical-align: bottom;
`;
