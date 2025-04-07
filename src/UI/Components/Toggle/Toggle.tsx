import React from 'react';
import { Button } from '@patternfly/react-core';
import { AngleDownIcon, AngleRightIcon } from '@patternfly/react-icons';

interface ToggleProps {
  expanded: boolean;
  onToggle: () => void;
  [k: string]: unknown;
}

export const Toggle: React.FC<ToggleProps> = ({
  expanded,
  onToggle,
  ...props
}) => (
  <Button
    icon={expanded ? <AngleDownIcon /> : <AngleRightIcon />}
    variant="plain"
    onClick={onToggle}
    {...props}
  />
);
