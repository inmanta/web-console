import React from "react";
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  Title,
} from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";

export const EmptyFiller: React.FC = () => (
  <EmptyState>
    <EmptyStateIcon icon={SearchIcon} />
    <Title headingLevel="h5" size="lg">
      {words("events.empty.title")}
    </Title>
    <EmptyStateBody>{words("events.empty.body")}</EmptyStateBody>
  </EmptyState>
);
