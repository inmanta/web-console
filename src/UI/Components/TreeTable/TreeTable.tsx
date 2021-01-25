import React, { useState } from "react";
import styled from "styled-components";
import { Tbody, TableComposable, Thead, Tr, Th } from "@patternfly/react-table";
import { TreeRowView } from "./TreeRow";
import { TreeTableHelper } from "./TreeTableHelper";

interface Props {
  treeTableHelper: TreeTableHelper;
}

export const TreeTable: React.FC<Props> = ({ treeTableHelper }) => {
  const [expansionState, setExpansionState] = useState(
    treeTableHelper.getExpansionState()
  );

  const columns = treeTableHelper.getColumns();
  const rows = treeTableHelper.createRows(expansionState, setExpansionState);

  return (
    <StyledTableComposable variant="compact">
      <Thead>
        <Tr>
          {columns.map((column) => (
            <Th key={column}>{column}</Th>
          ))}
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
