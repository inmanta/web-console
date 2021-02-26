import React from "react";
import { words } from "@/UI/words";
import {
  EmptyState,
  EmptyStateIcon,
  Spinner,
  Title,
} from "@patternfly/react-core";
import { Delayed } from "@/UI/Utils";

interface Props {
  delay?: number;
}

export const LoadingView: React.FC<Props> = ({ delay }) => (
  <Delayed delay={delay}>
    <EmptyState>
      <EmptyStateIcon variant="container" component={Spinner} />
      <Title size="lg" headingLevel="h4">
        {words("loading")}
      </Title>
    </EmptyState>
  </Delayed>
);
