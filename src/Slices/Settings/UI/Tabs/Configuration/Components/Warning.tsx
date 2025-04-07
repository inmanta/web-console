import React from 'react';
import { Icon, Tooltip } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { words } from '@/UI';

export const Warning: React.FC = () => (
  <Icon status="warning" isInline>
    <Tooltip content={words('settings.warning.update')}>
      <ExclamationTriangleIcon data-testid="Warning" />
    </Tooltip>
  </Icon>
);
