import React from "react";
import { Tbody, Tr, Td } from "@patternfly/react-table";
import { LatestReleasedResourceRow } from "@/Core";
import { words } from "@/UI/words";

interface Props {
  row: LatestReleasedResourceRow;
}

export const ResourceRow: React.FC<Props> = ({ row }) => (
  <Tbody isExpanded={false}>
    <Tr aria-label="Resource Table Row">
      <Td dataLabel={words("resources.column.type")}>{row.type}</Td>
      <Td dataLabel={words("resources.column.agent")}>{row.agent}</Td>
      <Td dataLabel={words("resources.column.value")}>{row.value}</Td>
      <Td dataLabel={words("resources.column.numberOfDependencies")}>
        {row.numberOfDependencies}
      </Td>
      <Td dataLabel={words("resources.column.deployState")}>
        {row.deployState}
      </Td>
    </Tr>
  </Tbody>
);
