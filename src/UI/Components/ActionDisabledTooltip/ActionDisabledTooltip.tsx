import React from "react";
import { Tooltip } from "@patternfly/react-core";
import styled from "styled-components";
import { words } from "@/UI/words";

interface Props {
  isDisabled?: boolean;
  ariaLabel: string;
  tooltipContent?: string;
}

export const ActionDisabledTooltip: React.FC<
  React.PropsWithChildren<Props>
> = ({
  children,
  isDisabled,
  ariaLabel,
  tooltipContent = words("inventory.statustab.actionDisabled"),
}) => {
  if (isDisabled) {
    return (
      <Tooltip entryDelay={200} content={tooltipContent}>
        <CursorNotAllowedContainer aria-label={ariaLabel}>
          {children}
        </CursorNotAllowedContainer>
      </Tooltip>
    );
  } else {
    return <>{children}</>;
  }
};

const CursorNotAllowedContainer = styled.span`
  cursor: not-allowed;
`;
