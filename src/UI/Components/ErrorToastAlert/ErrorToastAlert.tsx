import React from "react";
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
} from "@patternfly/react-core";
import styled from "styled-components";

interface Props {
  title: string;
  errorMessage: string;
  setErrorMessage: (message: string) => void;
}

export const ErrorToastAlert: React.FC<Props> = ({
  title,
  errorMessage,
  setErrorMessage,
}) => {
  return errorMessage ? (
    <AlertGroup isToast>
      <Alert
        variant={"danger"}
        title={title}
        actionClose={
          <AlertActionCloseButton onClose={() => setErrorMessage("")} />
        }
      >
        <StyledErrorMessage>{errorMessage}</StyledErrorMessage>
      </Alert>
    </AlertGroup>
  ) : null;
};

const StyledErrorMessage = styled.div`
  white-space: pre-wrap;
`;
