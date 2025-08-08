import React from "react";
import { Alert, AlertActionCloseButton, AlertGroup, AlertVariant } from "@patternfly/react-core";
import styled from "styled-components";

interface Props {
  title: string;
  type?: AlertVariant;
  message: string;
  setMessage: (message: string) => void;
}

/**
 * The ToastAlert Component
 *
 * @props {Props} props - The props of the components
 *  @prop {string} title - the title of the alert
 *  @prop {AlertVariant} type - the type of the alert
 *  @prop {string} message - the message of the alert
 *  @prop {function} setMessage - callback method to set the message
 *
 * @returns {React.FC<Props>} A React Component displaying the Toast Alert
 */
export const ToastAlert: React.FC<Props> = ({
  title,
  type = AlertVariant.danger,
  message,
  setMessage,
}) => {
  return message ? (
    <AlertGroup isToast aria-live="polite" isLiveRegion>
      <Alert
        data-testid="ToastAlert"
        variant={type}
        title={title}
        component="h3"
        actionClose={<AlertActionCloseButton onClose={() => setMessage("")} />}
      >
        <StyledMessage>{message}</StyledMessage>
      </Alert>
    </AlertGroup>
  ) : null;
};

const StyledMessage = styled.div`
  white-space: pre-wrap;
`;
