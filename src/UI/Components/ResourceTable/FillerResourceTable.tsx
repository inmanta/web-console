import React, { ReactElement } from "react";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";

interface Props {
  filler: ReactElement;
}

export const FillerResourceTable: React.FC<Props> = ({ filler }) => {
  const columns = ["Resource Id", "Details", "State"];
  const rows = [
    { heightAuto: true, cells: [{ props: { colSpan: 8 }, title: filler }] },
  ];

  return (
    <Table cells={columns} rows={rows} aria-label="ResourceTable-Empty">
      <TableHeader />
      <TableBody />
    </Table>
  );
};
