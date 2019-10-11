import { IResourceModel } from "@app/Models/LsmModels";
import React from "react";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";

export const ResourceTable: React.FunctionComponent<{ resources: IResourceModel[] }> = props => {
  const columns = ["Resource Id", "State"];
  const instanceId = props.resources[0].instanceId;
  const rows = props.resources.map(resource => {
    return {
      cells: [
        resource.resource_id,
        resource.resource_state
      ]
    }
  });

  return (
    <Table caption={`Resources for instance with id ${instanceId}`} cells={columns} rows={rows}>
      <TableHeader />
      <TableBody />
    </Table>
  );
}