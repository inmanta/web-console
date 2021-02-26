import React from "react";
import { words } from "@/UI/words";
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Title,
} from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";

export const EmptyView: React.FC = () => (
  <EmptyState>
    <EmptyStateIcon icon={SearchIcon} />
    <Title size="lg" headingLevel="h4">
      {words("inventory.empty.title")}
    </Title>
    <EmptyStateBody>{words("inventory.empty.body")}</EmptyStateBody>
  </EmptyState>
);
