import React from "react";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";

interface Props {
  "aria-label"?: string;
}

export const ResourceTableWrapper: React.FC<Props> = ({
  children,
  ...props
}) => {
  const columns = ["Resource Id", "Details", "State"];
  const rows = [
    { heightAuto: true, cells: [{ props: { colSpan: 8 }, title: children }] },
  ];

  return (
    <Table cells={columns} rows={rows} aria-label={props["aria-label"]}>
      <TableHeader />
      <TableBody />
    </Table>
  );
};
