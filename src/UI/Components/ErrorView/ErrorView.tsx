import React from "react";
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Title,
} from "@patternfly/react-core";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";
import { Delayed } from "@/UI/Utils";

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
}) => (
  <Delayed delay={delay}>
    <EmptyState {...props}>
      <EmptyStateIcon icon={ExclamationTriangleIcon} />
      <Title headingLevel="h4" size="lg">
        {title || words("error")}
      </Title>
      <EmptyStateBody>{message}</EmptyStateBody>
      {retry && (
        <Button variant="primary" onClick={retry}>
          {words("retry")}
        </Button>
      )}
    </EmptyState>
  </Delayed>
);
