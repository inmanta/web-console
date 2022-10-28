import React from "react";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";

interface Props {
  "aria-label"?: string;
  id?: string;
}

export const ResourceTableWrapper: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  ...props
}) => {
  const columns = ["Resource Id", "State"];
  const rows = [
    { heightAuto: true, cells: [{ props: { colSpan: 8 }, title: children }] },
  ];

  return (
    <Table cells={columns} rows={rows} aria-label={props["aria-label"]}>
      <TableHeader
        id={props.id ? `resource-table-header-${props.id}` : undefined}
      />
      <TableBody />
    </Table>
  );
};
