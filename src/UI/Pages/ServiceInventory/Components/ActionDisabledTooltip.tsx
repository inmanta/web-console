import { words } from "@/UI";
import { Tooltip } from "@patternfly/react-core";
import React from "react";
import { ReactElement } from "react";
import styled from "styled-components";

interface Props {
  // Type of children from the Tooltip component of Patternfly
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  children?: ReactElement<any>;
  isDisabled?: boolean;
  ariaLabel: string;
}

export const ActionDisabledTooltip: React.FC<Props> = ({
  children,
  isDisabled,
  ariaLabel,
}) => {
  if (isDisabled) {
    return (
      <Tooltip
        entryDelay={200}
        content={words("inventory.statustab.actionDisabled")}
      >
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
  cursor: "not-allowed";
`;
