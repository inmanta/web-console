import React from "react";
import { Tooltip } from "@patternfly/react-core";
import styled from "styled-components";
import { words } from "@/UI/words";

interface Props {
  isDisabled?: boolean;
  testingId: string;
  tooltipContent?: string;
}

export const ActionDisabledTooltip: React.FC<
  React.PropsWithChildren<Props>
> = ({
  children,
  isDisabled,
  testingId,
  tooltipContent = words("inventory.statustab.actionDisabled"),
}) => {
  if (isDisabled) {
    return (
      <Tooltip entryDelay={200} content={tooltipContent}>
        <CursorNotAllowedContainer data-testid={testingId}>
          {children}
        </CursorNotAllowedContainer>
      </Tooltip>
    );
  } else {
    return <>{children}</>;
  }
};

const CursorNotAllowedContainer = styled.span`
  margin-block-start: calc(-1 * var(--pf-v6-c-form__actions--MarginBlockStart));
  margin-block-end: calc(-1 * var(--pf-v6-c-form__actions--MarginBlockEnd));
  margin-inline-start: calc(
    -1 * var(--pf-v6-c-form__actions--MarginInlineStart)
  );
  margin-inline-end: calc(-1 * var(--pf-v6-c-form__actions--MarginInlineEnd));
  cursor: not-allowed;
`;
