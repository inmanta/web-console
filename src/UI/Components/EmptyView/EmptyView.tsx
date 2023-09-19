import React from "react";
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateHeader,
} from "@patternfly/react-core";
import { ExclamationCircleIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";

interface Props {
  message: string;
  title?: string;
}

export const EmptyView: React.FC<Props> = ({ title, message, ...props }) => (
  <EmptyState {...props}>
    <EmptyStateHeader
      titleText={<>{title || words("empty.title")}</>}
      icon={<EmptyStateIcon icon={ExclamationCircleIcon} />}
      headingLevel="h4"
    />
    <EmptyStateBody>{message}</EmptyStateBody>
  </EmptyState>
);
