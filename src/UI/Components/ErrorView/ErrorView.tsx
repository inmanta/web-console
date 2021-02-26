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
  error: string;
  retry?: () => void;
  delay?: number;
}

export const ErrorView: React.FC<Props> = ({ error, retry, delay }) => (
  <Delayed delay={delay}>
    <EmptyState>
      <EmptyStateIcon icon={ExclamationTriangleIcon} />
      <Title headingLevel="h4" size="lg">
        {words("error")}
      </Title>
      <EmptyStateBody>{error}</EmptyStateBody>
      {retry && (
        <Button variant="primary" onClick={retry}>
          {words("retry")}
        </Button>
      )}
    </EmptyState>
  </Delayed>
);
