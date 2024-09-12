import React from "react";
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
} from "@patternfly/react-core";

interface ToastAlertMessageProps {
  message: string;
  id: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  variant: "danger" | "success";
}

export const ToastAlertMessage: React.FC<ToastAlertMessageProps> = ({
  message,
  id,
  setMessage,
  variant,
}) => {
  return (
    <AlertGroup isToast={true}>
      <Alert
        variant={variant}
        title={message}
        data-testid={`${id}-error-message`}
        actionClose={
          <AlertActionCloseButton
            data-testid={`${id}-close-error-message`}
            onClose={() => setMessage("")}
          />
        }
      />
    </AlertGroup>
  );
};
