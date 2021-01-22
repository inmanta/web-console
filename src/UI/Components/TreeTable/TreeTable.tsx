import React, { useState } from "react";
import styled from "styled-components";
import { Tbody, TableComposable, Thead, Tr, Th } from "@patternfly/react-table";
import { TreeExpansionManager } from "./TreeExpansionManager";
import { TreeRowView } from "./TreeRow";
import {
  getKeyPaths,
  getKeyPathsWithValue,
  getRows,
  mergeDescriptors,
} from "./getKeyPaths";
import { Attributes } from "@/Core";

interface Props {
  attributes: Attributes;
}

export const TreeTable: React.FC<Props> = ({ attributes }) => {
  const SEPARATOR = "$";
  const expansionManager = new TreeExpansionManager(SEPARATOR);
  const paths = getKeyPaths(SEPARATOR, "", {
    ...attributes.active,
    ...attributes.candidate,
    ...attributes.rollback,
  });

  const [expansionState, setExpansionState] = useState(
    expansionManager.create(paths)
  );

  const onToggle = (key) => () => {
    setExpansionState(expansionManager.toggle(expansionState, key));
  };

  const candidateDescriptors = getKeyPathsWithValue(
    SEPARATOR,
    "",
    attributes.candidate
  );
  const activeDescriptors = getKeyPathsWithValue(
    SEPARATOR,
    "",
    attributes.active
  );
  const rollbackDescriptors = getKeyPathsWithValue(
    SEPARATOR,
    "",
    attributes.rollback
  );

  const mergedDescriptors = mergeDescriptors(
    candidateDescriptors,
    activeDescriptors,
    rollbackDescriptors
  );

  const rows = getRows(
    SEPARATOR,
    onToggle,
    expansionManager,
    expansionState,
    mergedDescriptors
  );

  return (
    <StyledTableComposable variant="compact">
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
    </StyledTableComposable>
  );
};

const StyledTableComposable = styled(TableComposable)`
  --pf-c-table__expandable-row--after--border-width--base: 0px;
`;
