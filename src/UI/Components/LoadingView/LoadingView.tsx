import React from "react";
import { EmptyState, EmptyStateIcon, Title } from "@patternfly/react-core";
import { Spinner } from "@/UI/Components/Spinner";
import { Delayed } from "@/UI/Utils";
import { words } from "@/UI/words";

interface Props {
  instant?: boolean;
  ariaLabel?: string;
}

export const LoadingView: React.FC<Props> = ({
  instant,
  ariaLabel,
  ...props
}) => (
  <EmptyState isFullHeight {...props} aria-label={ariaLabel} role="region">
    <Delayed delay={instant ? undefined : 200}>
      <EmptyStateIcon icon={Spinner} />
      <Title size="lg" headingLevel="h4">
        {words("loading")}
      </Title>
    </Delayed>
  </EmptyState>
);
