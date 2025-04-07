import React from 'react';
import { EmptyState, EmptyStateBody } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { words } from '@/UI/words';

interface Props {
  message: string;
  title?: string;
}

export const EmptyView: React.FC<Props> = ({ title, message, ...props }) => (
  <EmptyState
    headingLevel="h2"
    icon={ExclamationCircleIcon}
    titleText={<>{title || words('empty.title')}</>}
    {...props}
  >
    <EmptyStateBody>{message}</EmptyStateBody>
  </EmptyState>
);
