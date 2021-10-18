import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
} from "@patternfly/react-core";
import React from "react";

interface Props {
  errorMessage: string;
  setErrorMessage: (message: string) => void;
}

export const ErrorToastAlert: React.FC<Props> = ({
  errorMessage,
  setErrorMessage,
}) => {
  return errorMessage ? (
    <AlertGroup isToast>
      <Alert
        variant={"danger"}
        title={errorMessage}
        actionClose={
          <AlertActionCloseButton onClose={() => setErrorMessage("")} />
        }
      />
    </AlertGroup>
  ) : null;
};
