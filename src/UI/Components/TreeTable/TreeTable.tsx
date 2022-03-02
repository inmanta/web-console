import React, { useState } from "react";
import { Tbody, TableComposable, Thead, Tr, Th } from "@patternfly/react-table";
import styled from "styled-components";
import { ColumnHeaders } from "./ColumnHeaders";
import { TreeTableHelper } from "./Helpers";
import { TreeRowView, Indent } from "./TreeRow";

interface Props {
  treeTableHelper: TreeTableHelper;
  id?: string;
}

export const TreeTable: React.FC<Props> = ({ treeTableHelper, id }) => {
  const [expansionState, setExpansionState] = useState(
    treeTableHelper.getExpansionState()
  );

  const [firstColumn, ...columns] = treeTableHelper.getColumns();
  const rows = treeTableHelper.createRows(expansionState, setExpansionState);
  const emptyColumns = treeTableHelper.getEmptyAttributeSets();

  return (
    <StyledTableComposable
      variant="compact"
      data-testid={id ? `attributes-tree-table-${id}` : "attributes-tree-table"}
    >
      <Thead>
        <Tr>
          <Th key={firstColumn} className="pf-m-width-40">
            <Indent level={0} noToggle>
              {firstColumn}
            </Indent>
          </Th>
          <ColumnHeaders columns={columns} emptyColumns={emptyColumns} />
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
