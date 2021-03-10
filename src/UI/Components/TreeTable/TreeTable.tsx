import React, { useState } from "react";
import styled from "styled-components";
import { Tbody, TableComposable, Thead, Tr, Th } from "@patternfly/react-table";
import { TreeRowView, Indent } from "./TreeRow";
import { TreeTableHelper } from "./Helpers";

interface Props {
  treeTableHelper: TreeTableHelper;
}

export const TreeTable: React.FC<Props> = ({ treeTableHelper }) => {
  const [expansionState, setExpansionState] = useState(
    treeTableHelper.getExpansionState()
  );

  const [firstColumn, ...columns] = treeTableHelper.getColumns();
  const rows = treeTableHelper.createRows(expansionState, setExpansionState);

  return (
    <StyledTableComposable
      variant="compact"
      data-testid={"attributes-tree-table"}
    >
      <Thead>
        <Tr>
          <Th key={firstColumn} className="pf-m-width-40">
            <Indent level={0} noToggle>
              {firstColumn}
            </Indent>
          </Th>
          {columns.map((column) => (
            <Th key={column} className="pf-m-width-20">
              {column}
            </Th>
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
