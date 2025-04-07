import React from "react";
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
} from "@patternfly/react-core";

interface ToastAlertMessageProps {
  stateErrorMessage: string;
  id: string;
  setStateErrorMessage: React.Dispatch<React.SetStateAction<string>>;
}

export const ToastAlertMessage: React.FC<ToastAlertMessageProps> = ({
  stateErrorMessage,
  id,
  setStateErrorMessage,
}) => {
  return (
    <AlertGroup isToast={true}>
      <Alert
        variant="danger"
        title={stateErrorMessage}
        data-testid={`${id}-error-message`}
        actionClose={
          <AlertActionCloseButton
            data-testid={`${id}-close-error-message`}
            onClose={() => setStateErrorMessage("")}
          />
        }
      />
    </AlertGroup>
  );
};
