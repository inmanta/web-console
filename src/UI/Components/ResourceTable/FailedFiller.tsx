import React from "react";
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Title,
} from "@patternfly/react-core";
import { words } from "@/UI/words";

export const FailedFiller: React.FC<{ error: string }> = ({ error }) => (
  <EmptyState variant={EmptyStateVariant.small}>
    <Title headingLevel="h2" size="lg">
      {words("inventory.resourcesTab.failed.title")}
    </Title>
    <EmptyStateBody>
      {words("inventory.resourcesTab.failed.body")}
      <p>{error}</p>
    </EmptyStateBody>
  </EmptyState>
);
