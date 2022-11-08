import React from "react";
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  AlertVariant,
} from "@patternfly/react-core";
import styled from "styled-components";

interface Props {
  title: string;
  type?: AlertVariant;
  message: string;
  setMessage: (message: string) => void;
}

export const ToastAlert: React.FC<Props> = ({
  title,
  type = AlertVariant.danger,
  message,
  setMessage,
}) => {
  return message ? (
    <AlertGroup isToast>
      <Alert
        aria-label="ToastAlert"
        variant={type}
        title={title}
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
