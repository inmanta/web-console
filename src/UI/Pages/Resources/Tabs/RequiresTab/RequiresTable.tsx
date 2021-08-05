import React from "react";
import { ResourceStatus } from "@/Core";
import { ResourceStatusCell } from "@/UI/Components";
import { words } from "@/UI/words";
import {
  Table,
  TableBody,
  TableHeader,
  TableVariant,
} from "@patternfly/react-table";

interface Props {
  requiresStatus: Record<string, ResourceStatus>;
  "aria-label"?: string;
}
export const RequiresTable: React.FC<Props> = ({
  requiresStatus,
  ...props
}) => {
  const columns = [
    words("resources.requires.resourceId"),
    words("resources.requires.deployState"),
  ];
  const rows = Object.entries(requiresStatus).map(([resource_id, status]) => ({
    cells: [resource_id, { title: <ResourceStatusCell state={status} /> }],
  }));
  return (
    <Table
      cells={columns}
      rows={rows}
      aria-label={props["aria-label"]}
      variant={TableVariant.compact}
    >
      <TableHeader />
      <TableBody />
    </Table>
  );
};
