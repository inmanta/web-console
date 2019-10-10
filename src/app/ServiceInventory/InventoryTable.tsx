import { IServiceInstanceModel } from "@app/Models/LsmModels";
import React from "react";
import { TableHeader, Table, TableBody } from "@patternfly/react-table";
import { List, ListItem } from "@patternfly/react-core";

export const InventoryTable: React.FunctionComponent<{ instances: IServiceInstanceModel[] }> = props => {
  const columnsInOrder = ["State", "Active Attributes", "Candidate Attributes", "Version", "Last Updated"];
  const instances = [...props.instances];
  const rows = instances.map(instance => {
    const activeAttributes = getFormattedListFromObject(instance, 'active_attributes');
    const candidateAttributes = getFormattedListFromObject(instance, 'candidate_attributes');
    return {
      cells: [
        instance.state,
        activeAttributes,
        candidateAttributes,
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

function getFormattedListFromObject(instance: IServiceInstanceModel, key: string) {
  return instance[key] ? (
    <List role="list">
      {
        Object
          .keys(instance[key])
          .map(attribute =>
            <ListItem key={attribute}>
              {attribute}: {instance[key][attribute]}
            </ListItem>)
      }
    </List>) : null;
}