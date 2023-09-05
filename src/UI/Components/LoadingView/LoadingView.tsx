import React from "react";
import { EmptyState, EmptyStateIcon, Title } from "@patternfly/react-core";
import { Spinner } from "@/UI/Components/Spinner";
import { Delayed } from "@/UI/Utils";
import { words } from "@/UI/words";

interface Props {
  instant?: boolean;
}

export const LoadingView: React.FC<Props> = ({ instant, ...props }) => (
  <EmptyState isFullHeight {...props}>
    <Delayed delay={instant ? undefined : 200}>
      <EmptyStateIcon icon={Spinner} />
      <Title size="lg" headingLevel="h4">
        {words("loading")}
      </Title>
    </Delayed>
  </EmptyState>
);
