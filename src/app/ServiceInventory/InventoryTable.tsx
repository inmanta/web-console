import { IServiceInstanceModel } from "@app/Models/LsmModels";
import React from "react";
import { TableHeader, Table, TableBody } from "@patternfly/react-table";
import { Label, List, ListItem } from "@patternfly/react-core";

export const InventoryTable: React.FunctionComponent<{ instances: IServiceInstanceModel[] }> = props => {
  const columnsInOrder = ["State", "Active Attributes", "Version", "Last Updated"];
  const instances = [...props.instances];

  const rows = instances.map(instance => {
    const attributes = (
      <List>
        {
          Object
            .keys(instance.active_attributes)
            .map(attribute =>
              <ListItem key={attribute}>
                {attribute}: {instance.active_attributes[attribute]}
              </ListItem>)
        }
      </List>);
    return {
      cells: [
        instance.state,
        attributes,
        instance.version,
        instance.last_updated
      ]
    }
  });

  return (
    <Table aria-label="Instances" cells={columnsInOrder} rows={rows}>
      <TableHeader />
      <TableBody />
    </Table>
  );
};