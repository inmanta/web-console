import { IServiceInstanceModel } from "@app/Models/LsmModels";
import React from "react";
import { TableHeader, Table, TableBody } from "@patternfly/react-table";
import { List, ListItem } from "@patternfly/react-core";
import moment from 'moment';
import { ResourceModal } from "./ResourceModal";
import { InstanceModal, ButtonType } from "./InstanceModal";

export const InventoryTable: React.FunctionComponent<{ instances: IServiceInstanceModel[] }> = props => {
  const columnsInOrder = ["Id", "State", "Candidate Attributes", "Active Attributes", "Rollback Attributes", "Version", "Last Updated", "Resources", "Actions"];
  const instances = [...props.instances];
  const rows = instances.map(instance => {
    const activeAttributes = getFormattedListFromObject(instance, 'active_attributes');
    const candidateAttributes = getFormattedListFromObject(instance, 'candidate_attributes');
    const rollbackAttributes = getFormattedListFromObject(instance, 'rollback_attributes');
    const resourceModal = <ResourceModal instance={instance} />
    let actions = <React.Fragment />
    if (instance.state !== "terminated") {
      actions = <div>
        <InstanceModal buttonType={ButtonType.edit} serviceName={instance.service_entity} instance={instance} />
        <span className="pf-u-pr-xl pf-u-pl-xl" />
        <InstanceModal buttonType={ButtonType.delete} serviceName={instance.service_entity} instance={instance} />
      </div>
    }
    return {
      cells: [
        instance.id.substring(0, 4),
        instance.state,
        candidateAttributes,
        activeAttributes,
        rollbackAttributes,
        instance.version,
        moment(instance.last_updated).format('MMMM Do YYYY, h:mm:ss a'),
        { title: resourceModal, props: { instance } },
        { title: actions }
      ]
    }
  });


  return (
    <React.Fragment>
      <Table aria-label="Instances" cells={columnsInOrder} rows={rows}>
        <TableHeader />
        <TableBody rowKey={({ rowData, rowIndex }) => rowIndex} />
      </Table>
    </React.Fragment>
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
            </ListItem>
          })
      }
    </List>) : null;
}