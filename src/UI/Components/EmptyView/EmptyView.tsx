import React from "react";
import { words } from "@/UI/words";
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Title,
} from "@patternfly/react-core";
import { ExclamationCircleIcon } from "@patternfly/react-icons";

interface Props {
  message: string;
}

export const EmptyView: React.FC<Props> = ({ message }) => (
  <EmptyState>
    <EmptyStateIcon icon={ExclamationCircleIcon} />
    <Title size="lg" headingLevel="h4">
      {words("empty.title")}
    </Title>
    {message && <EmptyStateBody>{message}</EmptyStateBody>}
  </EmptyState>
);
