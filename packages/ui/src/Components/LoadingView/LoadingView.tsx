import React from "react";
import { EmptyState, Title } from "@patternfly/react-core";
import { words } from "@inmanta/web-console-core";
import { Spinner } from "@inmanta/web-console-ui/Components/Spinner";
import { Delayed } from "@inmanta/web-console-ui/Utils";

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
