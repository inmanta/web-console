import React, { useState } from 'react';
import {
  Button,
  DataList,
  DataListItem,
  DataListItemRow,
  DataListToggle,
  DataListItemCells,
  DataListCell,
  DataListContent,
  DataListAction
} from '@patternfly/react-core';
import { IServiceModel } from '@app/Models/LsmModels';
import { CatalogContent } from './CatalogContent';

export const CatalogDataList: React.FunctionComponent<{ services?: IServiceModel[] }> = props => {
  const [expanded, setExpanded] = useState(['']);
  let serviceItems;
  if (props.services) {
    serviceItems = props.services.map(service => {
      const toggleId = service.name + '-toggle';
      const serviceKey = service.name + '-item';
      const expandKey = service.name + '-expand';
      return (
        <DataListItem key={serviceKey} aria-labelledby={serviceKey} isExpanded={expanded.includes(toggleId)}>
          <DataListItemRow>
            <DataListToggle
              onClick={() => onToggle(toggleId)}
              isExpanded={expanded.includes(toggleId)}
              id={toggleId}
              aria-controls={expandKey}
            />
            <DataListItemCells
              dataListCells={[
                <DataListCell key="primary content">
                  <div id={serviceKey}>{service.name}</div>
                </DataListCell>
              ]}
            />
            <DataListAction
              aria-labelledby={service.name + '-action'}
              id={service.name + '-action'}
              aria-label="Actions"
            >
              <Button> Inventory </Button>
              <Button variant="danger"> Delete </Button>
            </DataListAction>
          </DataListItemRow>
          <DataListContent aria-label="Primary Content Details" id={expandKey} isHidden={!expanded.includes(toggleId)}>
            <CatalogContent service={service} />
          </DataListContent>
        </DataListItem>
      );
    });
  }

  const onToggle = id => {
    const index = expanded.indexOf(id);
    const newExpanded =
      index >= 0 ? [...expanded.slice(0, index), ...expanded.slice(index + 1, expanded.length)] : [...expanded, id];
    setExpanded(newExpanded);
  };
  return <DataList aria-label="Expandable data list example">{serviceItems}</DataList>;
};
