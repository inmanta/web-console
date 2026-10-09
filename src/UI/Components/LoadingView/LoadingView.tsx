import React from "react";
import { EmptyState, Title } from "@patternfly/react-core";
import { Spinner } from "@/UI/Components";
import { Delayed } from "@/UI/Utils";
import { words } from "@/UI/words";

interface Props {
  instant?: boolean;
  ariaLabel?: string;
}

const LoadingIcon = () => <Spinner size={56} />;

export const LoadingView: React.FC<Props> = ({ instant, ariaLabel, ...props }) => (
  <EmptyState isFullHeight {...props} aria-label={ariaLabel} role="region" icon={LoadingIcon}>
    <Delayed delay={instant ? undefined : 200}>
      <Title size="lg" headingLevel="h2">
        {words("loading")}
      </Title>
    </Delayed>
  </EmptyState>
);
