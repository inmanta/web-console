import React from "react";
import {
  TableComposable,
  TableVariant,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import { words } from "@/UI/words";
import { DesiredStateVersion } from "@S/DesiredState/Core/Domain";
import { DesiredStatesTableRow } from "./DesiredStatesTableRow";

interface Props {
  rows: DesiredStateVersion[];
  "aria-label": string;
}

export const DesiredStatesTable: React.FC<Props> = ({ rows, ...props }) => {
  const columnNames = [
    words("desiredState.columns.date"),
    words("desiredState.columns.version"),
    words("desiredState.columns.status"),
    words("desiredState.columns.resources"),
    words("desiredState.columns.labels"),
  ];
  const heads = columnNames.map((displayName) => (
    <Th key={displayName}>{displayName}</Th>
  ));

  return (
    <TableComposable {...props} variant={TableVariant.compact}>
      <Thead>
        <Tr>{heads}</Tr>
      </Thead>
      {rows.map((row) => (
        <DesiredStatesTableRow row={row} key={row.version.toString()} />
      ))}
    </TableComposable>
  );
};
