import React, { useContext } from 'react';
import { Content } from '@patternfly/react-core';
import { DependencyContext } from '@/UI/Dependency';

export const SelectedEnv: React.FC = () => {
  const { environmentHandler } = useContext(DependencyContext);
  const selected = environmentHandler.useSelected();

  return selected !== undefined ? (
    <Content component="p">Current env: {selected?.name}</Content>
  ) : null;
};
