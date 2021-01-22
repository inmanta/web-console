import React, { useState } from "react";
import styled from "styled-components";
import { Tbody, TableComposable, Thead, Tr, Th } from "@patternfly/react-table";
import { TreeExpansionManager } from "./TreeExpansionManager";
import { TreeRowView } from "./TreeRow";
import { getRows } from "./getKeyPaths";
import { Attributes } from "@/Core";
import { RowHelper } from "./RowHelper";

interface Props {
  attributes: Attributes;
}

export const TreeTable: React.FC<Props> = ({ attributes }) => {
  const SEPARATOR = "$";
  const expansionManager = new TreeExpansionManager(SEPARATOR);
  const rowHelper = new RowHelper(SEPARATOR);
  const attributePaths = rowHelper.getPaths(attributes);
  const [expansionState, setExpansionState] = useState(
    expansionManager.create(attributePaths)
  );

  const getOnToggle = (key) => () => {
    setExpansionState(expansionManager.toggle(expansionState, key));
  };

  const multiAttributeDict = rowHelper.getMultiAttributeDict(attributes);

  const rows = getRows(
    SEPARATOR,
    getOnToggle,
    expansionManager,
    expansionState,
    multiAttributeDict
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
