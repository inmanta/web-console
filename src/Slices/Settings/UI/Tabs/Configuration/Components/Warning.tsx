import React from "react";
import { Icon, Tooltip } from "@patternfly/react-core";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";
import { t_global_icon_color_status_warning_default } from "@patternfly/react-tokens";
import styled from "styled-components";

export const Warning: React.FC<{ className?: string }> = ({ className }) => (
  <Tooltip content="Changed value has not been saved">
    <IconWrapper className={className} data-testid="Warning">
      <Icon style={{ color: t_global_icon_color_status_warning_default.var }}>
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
