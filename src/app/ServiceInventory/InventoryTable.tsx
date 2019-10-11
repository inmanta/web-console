import { IServiceInstanceModel } from "@app/Models/LsmModels";
import React from "react";
import { TableHeader, Table, TableBody } from "@patternfly/react-table";
import { List, ListItem } from "@patternfly/react-core";
import moment from 'moment';
import { ResourceModal } from "./ResourceModal";

export const InventoryTable: React.FunctionComponent<{ instances: IServiceInstanceModel[] }> = props => {
  const columnsInOrder = ["State", "Active Attributes", "Candidate Attributes", "Rollback Attributes", "Version", "Last Updated", "Resources"];
  const instances = [...props.instances];
  const rows = instances.map(instance => {
    const activeAttributes = getFormattedListFromObject(instance, 'active_attributes');
    const candidateAttributes = getFormattedListFromObject(instance, 'candidate_attributes');
    const rollbackAttributes = getFormattedListFromObject(instance, 'rollback_attributes');
    const resourceModal =  <ResourceModal instance={instance}/>
    return {
      cells: [
        instance.state,
        activeAttributes,
        candidateAttributes,
        rollbackAttributes,
        instance.version,
        moment(instance.last_updated).format('MMMM Do YYYY, h:mm:ss a'),
        {title: resourceModal, props: {instance}}  
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
          .map(attribute => {
            const attributeValue = instance[key][attribute];
            return <ListItem key={attribute}>
              {attribute}: {Array.isArray(attributeValue) ? attributeValue.join(', ') : String(attributeValue)}
          </ListItem>})
      }
    </List>) : null;
}