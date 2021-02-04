import React from "react";
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  Title,
} from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";
import { words } from "@/UI/words";

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
                {words("inventory.resourcesTab.empty.title")}
              </Title>
              <EmptyStateBody>
                {words("inventory.resourcesTab.empty.body")}
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
      aria-label="ResourceTable-Empty"
    >
      <TableHeader />
      <TableBody />
    </Table>
  );
};
