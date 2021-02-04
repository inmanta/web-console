import React from "react";
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  Title,
} from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";

interface Props {
  caption: string;
}

export const EmptyResourceTable: React.FC<Props> = ({ caption }) => {
  const columns = ["Resource Id", "Details", "State"];
  const rows = [
    {
      heightAuto: true,
      cells: [
        {
          props: { colSpan: 8 },
          title: (
            <EmptyState>
              <EmptyStateIcon icon={SearchIcon} />
              <Title headingLevel="h5" size="lg">
                No resources found
              </Title>
              <EmptyStateBody>
                No resources could be found for this instance
              </EmptyStateBody>
            </EmptyState>
          ),
        },
      ],
    },
  ];

  return (
    <Table caption={caption} cells={columns} rows={rows}>
      <TableHeader />
      <TableBody />
    </Table>
  );
};
