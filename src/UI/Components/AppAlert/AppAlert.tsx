import React, { ReactNode } from "react";
import { Alert, AlertVariant, AlertActionCloseButton } from "@patternfly/react-core";
import styled from "styled-components";

export interface AppAlertProps {
  /** Title of the alert */
  title: string;

  /** Optional message body */
  message?: string | null;

  /** Alert variant (defaults to danger) */
  variant?: AlertVariant;

  /** Whether the alert should be inline (`true`) or toast (`false`) */
  isInline?: boolean;

  /** Callback invoked when the alert close button is clicked */
  onClose?: () => void;

  /** Optional data-testid for alert component */
  "data-testid"?: string;

  /** Optional data-testid for alert close*/
  closeTestId?: string;

  /** Optional icon */
  customIcon?: ReactNode;

  /** Optional custom content rendered inside the alert */
  children?: ReactNode;

  /** Optional flag to indiciate whether the alert is expandable or not */
  isExpandable?: boolean;

  /* Optional flag to indicate whether the alert should be plain without borders */
  isPlain?: boolean;

  /* Optional flag to limit the width of the alert to it's content */
  isLimitedWidth?: boolean;
}

/**
 * AppAlert Component
 *
 * Can render either inline alerts (`isInline=true`) or toast-style alerts (`isInline=false`).
 * Automatically wraps toast messages with `white-space: pre-wrap`.
 *
 * @param {AppAlertProps} props
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
        onClose ? <AlertActionCloseButton onClose={onClose} data-testid={closeTestId} /> : undefined
      }
      style={{
        width: isLimitedWidth ? "fit-content" : undefined,
      }}
      //Only set these whenever inline, AlertProvider handles these already on it's own
      isLiveRegion={isInline}
      aria-live={isInline ? "polite" : undefined}
    >
      {!!message &&
        (isInline ? <span>{message}</span> : <StyledToastMessage>{message}</StyledToastMessage>)}
      {!!children && children}
    </Alert>
  );
};

const StyledToastMessage = styled.div`
  white-space: pre-wrap;
`;
