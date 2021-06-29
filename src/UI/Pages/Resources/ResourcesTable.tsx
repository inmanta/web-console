import { LatestReleasedResourceRow } from "@/Core";
import { TableComposable, Th, Thead, Tr } from "@patternfly/react-table";
import React from "react";
import { ResourceRow } from "./ResourceRow";

interface Props {
  rows: LatestReleasedResourceRow[];
  columnHeads: string[];
}
export const ResourcesTable: React.FC<Props> = ({
  rows,
  columnHeads,
  ...props
}) => (
  <TableComposable {...props}>
    <Thead>
      <Tr>
        {columnHeads.map((columnHead) => (
          <Th key={columnHead}>{columnHead}</Th>
        ))}
      </Tr>
    </Thead>
    {rows.map((row) => (
      <ResourceRow row={row} key={row.id} />
    ))}
  </TableComposable>
);
