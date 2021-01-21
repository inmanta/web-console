import React, { useState } from "react";
import { Tbody, TableComposable, Thead, Tr, Th } from "@patternfly/react-table";
import { TreeExpansionManager } from "./TreeExpansionManager";
import { TreeRow, TreeRowView } from "./TreeRow";

export const TreeTable: React.FC = () => {
  const expansionManager = new TreeExpansionManager(".");

  const [expansionState, setExpansionState] = useState(
    expansionManager.create(["a", "a.b", "a.b.c"])
  );

  const onToggle = (key) => () => {
    setExpansionState(expansionManager.toggle(expansionState, key));
  };

  const b: TreeRow = {
    kind: "Flat",
    id: "b",
    cell: { label: "name", value: "b" },
    cells: [
      { label: "candidate", value: "blabla" },
      { label: "active", value: "blabla" },
      { label: "rollback", value: "blabla" },
    ],
  };

  const a: TreeRow = {
    kind: "Root",
    id: "a",
    isChildExpanded: expansionManager.get(expansionState, "a"),
    onToggle: onToggle("a"),
    cell: { label: "name", value: "a" },
  };

  const ab: TreeRow = {
    kind: "Branch",
    id: "a.b",
    isExpandedByParent: expansionManager.get(expansionState, "a"),
    isChildExpanded: expansionManager.get(expansionState, "a.b"),
    onToggle: onToggle("a.b"),
    level: 1,
    cell: { label: "name", value: "b" },
  };

  const abc: TreeRow = {
    kind: "Leaf",
    id: "a.b.c",
    isExpandedByParent: expansionManager.get(expansionState, "a.b"),
    cell: { label: "active", value: "c" },
    cells: [
      { label: "candidate", value: 123 },
      { label: "active", value: false },
      { label: "rollback", value: "blabla" },
    ],
    level: 2,
  };

  const rows = [b, a, ab, abc];

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
