import React from "react";
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
} from "@patternfly/react-core";

interface Props {
  message: string;
  id: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  variant: "danger" | "success";
}

/**
 * A generic Toast component
 *
 * @props {Props} Props - the props of the components
 *  @prop {string} message - the message to be displayed
 *  @prop {string} id - the id to be used in the test-id
 *  @prop { React.Dispatch<React.SetStateAction<string>>} setMessage - state callback that updates the message when the toast dissapears
 *  @prop {"danger" | "success"} variant - the variant of the toast that needs to be displayed
 * @returns {React.FC<Props>} A React Component displaying a toaster element
 */
export const ToastAlertMessage: React.FC<Props> = ({
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
