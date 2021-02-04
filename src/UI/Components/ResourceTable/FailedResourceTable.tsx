import React from "react";

import { Table, TableHeader, TableBody } from "@patternfly/react-table";
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Title,
} from "@patternfly/react-core";

interface Props {
  caption: string;
  error: string;
}

export const FailedResourceTable: React.FC<Props> = ({ caption, error }) => {
  const columns = ["Resource Id", "Details", "State"];
  const rows = [
    {
      heightAuto: true,
      cells: [
        {
          props: { colSpan: 8 },
          title: (
            <EmptyState variant={EmptyStateVariant.small}>
              <Title headingLevel="h2" size="lg">
                Something went wrong
              </Title>
              <EmptyStateBody>
                There was an error retrieving data.
                <p>{error}</p>
              </EmptyStateBody>
            </EmptyState>
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
      aria-label="ResourceTable-Failed"
    >
      <TableHeader />
      <TableBody />
    </Table>
  );
};
