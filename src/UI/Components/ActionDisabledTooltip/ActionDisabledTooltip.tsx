import React, { ReactElement } from "react";
import { Tooltip } from "@patternfly/react-core";
import styled from "styled-components";
import { words } from "@/UI/words";

interface Props {
  // Type of children from the Tooltip component of Patternfly
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  children?: ReactElement<any>;
  isDisabled?: boolean;
  ariaLabel: string;
  tooltipContent?: string;
}

export const ActionDisabledTooltip: React.FC<Props> = ({
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
