import React from 'react';
import { IAttributeModel } from '@app/Models/LsmModels';
import { Table, TableBody, TableHeader } from '@patternfly/react-table';

export const AttributeTable: React.FunctionComponent<{ attributes: IAttributeModel[] }> = props => {
  const attributes = [...props.attributes];
  const columns = Object.keys(attributes[0]);
  const rows = attributes.map(attribute => Object.values(attribute));

  return (
    <Table aria-label="Attributes" cells={columns} rows={rows}>
      <TableHeader />
      <TableBody />
    </Table>
  );
};
