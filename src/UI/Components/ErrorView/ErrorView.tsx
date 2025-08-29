import React from "react";
import { Button, EmptyState, EmptyStateBody, EmptyStateFooter } from "@patternfly/react-core";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { Delayed } from "@/UI/Utils";
import { words } from "@/UI/words";

interface Props {
  message: string;
  ariaLabel?: string;
  title?: string;
  retry?: () => void;
  delay?: number;
}

export const ErrorView: React.FC<Props> = ({
  message,
  title,
  retry,
  delay,
  ariaLabel,
  ...props
}) => {
  return (
    <Delayed delay={delay}>
      <EmptyState
        headingLevel="h2"
        data-testid="ErrorView"
        icon={ExclamationTriangleIcon}
        titleText={<>{title || words("error")}</>}
        {...props}
        aria-label={ariaLabel}
        role="region"
      >
        <EmptyStateBody>
          <StyledErrorMessage>{message}</StyledErrorMessage>
        </EmptyStateBody>
        <EmptyStateFooter>
          {retry && (
            <Button variant="primary" onClick={retry}>
              {words("retry")}
            </Button>
          )}
        </EmptyStateFooter>
      </EmptyState>
    </Delayed>
  );
};

const StyledErrorMessage = styled.div`
  white-space: pre-wrap;
  text-align: justify;
`;
