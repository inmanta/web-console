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
  title?: string;
}

export const EmptyView: React.FC<Props> = ({ title, message, ...props }) => (
  <EmptyState {...props}>
    <EmptyStateIcon icon={ExclamationCircleIcon} />
    <Title size="lg" headingLevel="h4">
      {title || words("empty.title")}
    </Title>
    <EmptyStateBody>{message}</EmptyStateBody>
  </EmptyState>
);
