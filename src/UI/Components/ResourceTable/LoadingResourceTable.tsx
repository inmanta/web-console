import React from "react";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";
import { Bullseye, Spinner } from "@patternfly/react-core";

interface Props {
  caption: string;
}

export const LoadingResourceTable: React.FC<Props> = ({ caption }) => {
  const columns = ["Resource Id", "Details", "State"];
  const rows = [
    {
      heightAuto: true,
      cells: [
        {
          props: { colSpan: 8 },
          title: (
            <Bullseye>
              <Spinner size="xl" />
            </Bullseye>
          ),
        },
      ],
    },
  ];

  return (
    <Table
      caption={caption}
      cells={columns}
      rows={rows}
      aria-label="ResourceTable-Loading"
    >
      <TableHeader />
      <TableBody />
    </Table>
  );
};
