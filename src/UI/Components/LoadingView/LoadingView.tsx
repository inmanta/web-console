import React from "react";
import {
  EmptyState,
  EmptyStateIcon,
  Spinner,
  Title,
} from "@patternfly/react-core";
import { Delayed } from "@/UI/Utils";
import { words } from "@/UI/words";

interface Props {
  delay?: number;
}

export const LoadingView: React.FC<Props> = ({ delay, ...props }) => (
  <EmptyState {...props}>
    <Delayed delay={delay}>
      <EmptyStateIcon variant="container" component={() => <Spinner isSVG />} />
      <Title size="lg" headingLevel="h4">
        {words("loading")}
      </Title>
    </Delayed>
  </EmptyState>
);
