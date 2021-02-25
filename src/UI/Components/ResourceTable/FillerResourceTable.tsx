import React, { ReactElement } from "react";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";

interface Props {
  filler: ReactElement;
  "aria-label"?: string;
}

export const FillerResourceTable: React.FC<Props> = ({ filler, ...props }) => {
  const columns = ["Resource Id", "Details", "State"];
  const rows = [
    { heightAuto: true, cells: [{ props: { colSpan: 8 }, title: filler }] },
  ];

  return (
    <Table cells={columns} rows={rows} aria-label={props["aria-label"]}>
      <TableHeader />
      <TableBody />
    </Table>
  );
};
