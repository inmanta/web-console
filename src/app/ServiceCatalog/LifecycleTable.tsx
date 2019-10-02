import { ILifecycleModel } from "@app/Models/LsmModels";
import React from "react";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";

export const LifecycleTable: React.FunctionComponent<{ lifecycle: ILifecycleModel }> = (props) => {
  const stateColumns = Object.keys(props.lifecycle.states[0]);
  const stringifyValues = (value) => {
    if (value != null && typeof value !== 'string') {
      return JSON.stringify(value);
    } else {
      return value;
    }
  }
  const stateRows = props.lifecycle.states.map(state => Object.values(state).map(value => stringifyValues(value)));

  const transferColumns = Object.keys(props.lifecycle.transfers[0]);
  const transferRows = props.lifecycle.transfers.map(transfer => Object.values(transfer).map(value => stringifyValues(value)));


  return (
    <div>Initial state: {props.lifecycle.initialState}
      <Table caption="States" cells={stateColumns} rows={stateRows}>
        <TableHeader />
        <TableBody />
      </Table>
      <Table caption="Transfers" cells={transferColumns} rows={transferRows}>
        <TableHeader />
        <TableBody />
      </Table>
    </div>);
}