import React from 'react';
import { Content, Label } from '@patternfly/react-core';
import { State } from '@/Core';

export const InstanceStateLabel: React.FC<State> = ({ name, label }) => {
  if (label) {
    return (
      <Label status={label} variant="outline">
        {name}
      </Label>
    );
  }

  return <Content>{name}</Content>;
};
