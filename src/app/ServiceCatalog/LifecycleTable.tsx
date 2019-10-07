import { ILifecycleModel } from '@app/Models/LsmModels';
import React from 'react';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';
import { Badge } from '@patternfly/react-core';

export const LifecycleTable: React.FunctionComponent<{ lifecycle: ILifecycleModel }> = props => {
  const columns = ['Source', 'Target', 'Error', 'Target Operation', 'Error Operation', 'Description', 'Event trigger'];
  const eventTriggerColumnNames = ['api_set_state', 'resource_based', 'auto', 'on_update', 'on_delete'];
  const modifierColumns = ['validate', 'config_name'];

  const rows = props.lifecycle.transfers.map(transferRow => {
    const modifiers = modifierColumns.map(modifier => (
      <Badge key={modifier} isRead={!transferRow[modifier]}>
        {modifier}
      </Badge>
    ));

    const triggers = eventTriggerColumnNames.filter(name => transferRow[name]);
    const eventTriggerColumn = (
      <React.Fragment>
        {modifiers} {triggers}
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
