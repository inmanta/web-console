import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateHeader,
  EmptyStateFooter,
} from "@patternfly/react-core";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { DependencyContext } from "@/UI/Dependency";
import { Delayed } from "@/UI/Utils";
import { words } from "@/UI/words";
import { Spacer } from "../Spacer";

interface Props {
  message: string;
  title?: string;
  retry?: () => void;
  delay?: number;
}

export const ErrorView: React.FC<Props> = ({
  message,
  title,
  retry,
  delay,
  ...props
}) => {
  const { authController } = useContext(DependencyContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (
      message.includes("Authorization failed, please log in") ||
      (message.includes("Not authenticated") &&
        authController.isEnabled() &&
        authController.shouldAuthLocally())
    ) {
      setTimeout(() => {
        navigate("/console/login");
      }, 1000);
    }
  }, [message, authController, navigate]);
  return (
    <Delayed delay={delay}>
      <EmptyState {...props}>
        <EmptyStateHeader
          titleText={<>{title || words("error")}</>}
          icon={<EmptyStateIcon icon={ExclamationTriangleIcon} />}
          headingLevel="h4"
        />
        <EmptyStateBody>
          <StyledErrorMessage>{message}</StyledErrorMessage>
          {(message.includes("Authorization failed, please log in") ||
            message.includes("Not authenticated")) &&
            authController.isEnabled() &&
            authController.shouldAuthLocally() && (
              <>
                <Spacer />
                <StyledErrorMessage>
                  Redirecting to log in page shortly...
                </StyledErrorMessage>
              </>
            )}
        </EmptyStateBody>
        <EmptyStateFooter>
          {retry && (
            <Button variant="primary" onClick={retry}>
              {words("retry")}
            </Button>
          )}
        </EmptyStateFooter>
      </EmptyState>
    </Delayed>
  );
};

const StyledErrorMessage = styled.div`
  white-space: pre-wrap;
  text-align: justify;
`;
