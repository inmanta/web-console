import React from "react";
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Title,
} from "@patternfly/react-core";
import { ExclamationCircleIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";

interface Props {
  error: string;
  retry?: () => void;
}

export const ErrorView: React.FC<Props> = ({ error, retry }) => (
  <EmptyState>
    <EmptyStateIcon icon={ExclamationCircleIcon} />
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
);
