import React, { useState } from "react";
import { Tbody, TableComposable, Thead, Tr, Th } from "@patternfly/react-table";
import { TreeExpansionManager } from "./TreeExpansionManager";
import { TreeRowView } from "./TreeRow";
import { getKeyPaths, getKeyPathsWithValue, getRows } from "./getKeyPaths";
import { Attributes } from "@/Core";

interface Props {
  attributes: Attributes;
}

export const TreeTable: React.FC<Props> = ({ attributes }) => {
  const SEPARATOR = "$";
  const expansionManager = new TreeExpansionManager(SEPARATOR);
  const paths = getKeyPaths("", attributes.active);

  const [expansionState, setExpansionState] = useState(
    expansionManager.create(paths)
  );

  const onToggle = (key) => () => {
    setExpansionState(expansionManager.toggle(expansionState, key));
  };

  const descriptors = getKeyPathsWithValue(SEPARATOR, "", attributes.active);

  const rows = getRows(
    SEPARATOR,
    onToggle,
    expansionManager,
    expansionState,
    descriptors
  );

  return (
    <TableComposable>
      <Thead>
        <Tr>
          <Th>name</Th>
          <Th>candidate</Th>
          <Th>active</Th>
          <Th>rollback</Th>
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((row) => (
          <TreeRowView key={row.id} row={row} />
        ))}
      </Tbody>
    </TableComposable>
  );
};
