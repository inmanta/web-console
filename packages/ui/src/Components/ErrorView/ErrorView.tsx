import React from "react";
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from "@patternfly/react-core";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { words } from "@inmanta/web-console-core";
import { Delayed } from "@inmanta/web-console-ui/Utils";

interface Props {
  message: string;
  ariaLabel?: string;
  title?: string;
  retry?: () => void;
  logout?: () => void;
  delay?: number;
}

/**
 * Shows an error message in an empty state, with optional Retry and Logout buttons.
 *
 * @props {Props} props - The props of the component.
 *  @prop {string} message - The error message to show.
 *  @prop {string} [ariaLabel] - The aria label of the empty state.
 *  @prop {string} [title] - The title, defaults to a generic error title.
 *  @prop {() => void} [retry] - Shows a Retry button that calls this function.
 *  @prop {() => void} [logout] - Shows a Logout button that calls this function.
 *  @prop {number} [delay] - Delay in milliseconds before the view shows.
 *
 * @returns {React.FC<Props>} The error view
 */
export const ErrorView: React.FC<Props> = ({
  message,
  title,
  retry,
  logout,
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
            <EmptyStateActions>
              <Button variant="primary" onClick={retry}>
                {words("retry")}
              </Button>
            </EmptyStateActions>
          )}
          {logout && (
            <EmptyStateActions>
              <Button variant="link" onClick={logout}>
                {words("dashboard.logout")}
              </Button>
            </EmptyStateActions>
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
