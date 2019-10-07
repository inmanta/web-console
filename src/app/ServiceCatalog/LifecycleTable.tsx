import { ILifecycleModel } from '@app/Models/LsmModels';
import React from 'react';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';
import { Badge, Label, Tooltip } from '@patternfly/react-core';

export const LifecycleTable: React.FunctionComponent<{ lifecycle: ILifecycleModel }> = props => {
  const columns = ['Source', 'Target', 'Error', 'Target Operation', 'Error Operation', 'Description', 'Event trigger'];
  const eventTriggerColumnNames = ['api_set_state', 'resource_based', 'auto', 'on_update', 'on_delete'];

  const rows = props.lifecycle.transfers.map(transferRow => {
    const validate = (
      <Tooltip content="This transfer goes to error target when validation fails.">
        <Badge key={'validate'} isRead={!transferRow.validate}>
          {'Validate'}
        </Badge>
      </Tooltip>);
    const config = transferRow.config_name ? (
      <Tooltip content={"This transfer is enabled when " + transferRow.config_name + " is set to true"}>
        <Badge key={'config_name'} isRead={!transferRow.config_name}>
          {transferRow.config_name}
        </Badge>
      </Tooltip>
    ) : '';

    const eventTrigger = <Label>{
      eventTriggerColumnNames
        .filter(name => transferRow[name])
        .map(trigger => trigger
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.substring(1))
          .join(' '))}
    </Label>;
    const eventTriggerColumn = (
      <React.Fragment>
        {validate} {config} {eventTrigger}
      </React.Fragment>
    );

    return {
      cells: [
        transferRow.source,
        transferRow.target,
        transferRow.error,
        transferRow.target_operation,
        transferRow.error_operation,
        transferRow.description,
        eventTriggerColumn
      ]
    };
  });
  return (
    <Table aria-label="Lifecycle" cells={columns} rows={rows}>
      <TableHeader />
      <TableBody />
    </Table>
  );
};
