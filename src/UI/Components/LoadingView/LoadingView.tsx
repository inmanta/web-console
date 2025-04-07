import React from 'react';
import { EmptyState, Spinner, Title } from '@patternfly/react-core';
import { Delayed } from '@/UI/Utils';
import { words } from '@/UI/words';

interface Props {
  instant?: boolean;
  ariaLabel?: string;
}

export const LoadingView: React.FC<Props> = ({
  instant,
  ariaLabel,
  ...props
}) => (
  <EmptyState
    isFullHeight
    {...props}
    aria-label={ariaLabel}
    role="region"
    icon={Spinner}
  >
    <Delayed delay={instant ? undefined : 200}>
      <Title size="lg" headingLevel="h2">
        {words('loading')}
      </Title>
    </Delayed>
  </EmptyState>
);
