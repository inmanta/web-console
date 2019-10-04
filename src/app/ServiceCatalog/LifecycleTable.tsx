import { ILifecycleModel } from "@app/Models/LsmModels";
import React from "react";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";
import { Label } from "@patternfly/react-core";

export const LifecycleTable: React.FunctionComponent<{ lifecycle: ILifecycleModel }> = (props) => {
  const columns = ["Source", "Target", "Error", "Target Operation", "Error Operation", "Description", "Event trigger"];
  const eventTriggerColumnNames = ["api_set_state", "resource_based", "auto"];
  const modifierColumns = ["validate", "config_name"];

  const rows = props.lifecycle.transfers.map(transferRow => {
    const modifiers = modifierColumns
      .reduce((acc, col) => {
        if (transferRow[col]) {
          acc.push(col);
        }
        return acc;
      }, [] as string[])
      .map(modifier => <Label key={modifier} isCompact={true}>{modifier}</Label>);

    const triggers =
      eventTriggerColumnNames.reduce((acc, trigger) => {
        if (transferRow[trigger]) {
          if (acc) {
            return trigger + ',' + acc;
          } else {
            return trigger;
          }
        }
        return acc;
      }, '');
    const eventTriggerColumn = <React.Fragment>{modifiers} {triggers}</React.Fragment>;

    return {
      cells: [
        transferRow.source, transferRow.target, transferRow.error,
        transferRow.target_operation, transferRow.error_operation,
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
}