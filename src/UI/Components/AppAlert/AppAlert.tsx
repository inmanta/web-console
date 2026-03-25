import React from "react";
import { Alert, AlertVariant, AlertActionCloseButton, AlertProps } from "@patternfly/react-core";
import styled from "styled-components";

export interface AppAlertProps extends AlertProps {
  /** Optional message body */
  message?: string | null;

  /** Callback invoked when the alert close button is clicked */
  onClose?: () => void;

  /** Optional data-testid for alert component */
  "data-testid"?: string;

  /** Optional data-testid for alert close*/
  closeTestId?: string;

  /* Optional flag to limit the width of the alert to it's content */
  isLimitedWidth?: boolean;
}

/**
 * AppAlert Component
 * Can render either inline alerts (`isInline=true`) or toast-style alerts (`isInline=false`).
 * @returns React element displaying an alert
 */

export const AppAlert: React.FC<AppAlertProps> = ({
  title,
  message,
  variant = AlertVariant.danger,
  isInline = false,
  onClose,
  "data-testid": testId,
  closeTestId = "alertClose",
  customIcon,
  children,
  isExpandable = false,
  isPlain = false,
  isLimitedWidth = false,
  ...rest
}) => {
  return (
    <Alert
      data-testid={testId}
      variant={variant}
      title={title}
      isInline={isInline}
      isExpandable={isExpandable}
      isPlain={isPlain}
      customIcon={customIcon}
      actionClose={
        onClose && <AlertActionCloseButton onClose={onClose} data-testid={closeTestId} />
      }
      style={{
        width: isLimitedWidth ? "fit-content" : undefined,
      }}
      //Only set these whenever inline, AlertProvider handles these already on it's own
      isLiveRegion={isInline}
      {...rest}
    >
      {!!message && <StyledToastMessage>{message}</StyledToastMessage>}
      {!!children && children}
    </Alert>
  );
};

const StyledToastMessage = styled.span`
  white-space: pre-line;
`;
