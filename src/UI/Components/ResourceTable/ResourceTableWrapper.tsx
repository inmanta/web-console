import React from "react";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";

interface Props {
  "aria-label"?: string;
  id?: string;
}

export const ResourceTableWrapper: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  ...props
}) => {
  const columns = ["Resource Id", "State"];

  return (
    <Table aria-label={props["aria-label"]}>
      <Thead id={props.id ? `resource-table-header-${props.id}` : undefined}>
        <Tr>
          {columns.map((col) => (
            <Th key={col}>{col}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td colSpan={8}>{children}</Td>
        </Tr>
      </Tbody>
    </Table>
  );
};
