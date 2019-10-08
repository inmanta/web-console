import React from 'react';
import { IServiceModel } from '@app/Models/LsmModels';
import { CatalogTabs } from './CatalogTabs';

export const CatalogContent: React.FunctionComponent<{ service: IServiceModel }> = props => {
  return <CatalogTabs service={props.service} />;
};
