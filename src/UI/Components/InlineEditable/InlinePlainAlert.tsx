import React from "react";
import { Alert, AlertActionCloseButton } from "@patternfly/react-core";
import styled from "styled-components";

interface Props {
  "aria-label": string;
  errorMessage: string;
  closeButtonAriaLabel: string;
  onCloseAlert: () => void;
}

export const InlinePlainAlert: React.FC<Props> = ({
  errorMessage,
  closeButtonAriaLabel,
  onCloseAlert,
  ...props
}) => (
  <WidthLimitedAlert
    aria-label={props["aria-label"]}
    variant="danger"
    isInline
    isPlain
    title={errorMessage}
    actionClose={
      <AlertActionCloseButton
        aria-label={closeButtonAriaLabel}
        onClick={onCloseAlert}
      />
    }
  />
);

const WidthLimitedAlert = styled(Alert)`
  width: fit-content;
`;
