import React, { useState } from "react";
import { Dropdown, DropdownItem, KebabToggle } from "@patternfly/react-core";
import { Tbody, TableComposable, Thead, Tr, Th } from "@patternfly/react-table";
import styled from "styled-components";
import { ParsedNumber } from "@/Core";
import { words } from "@/UI/words";
import { ColumnHeaders } from "./ColumnHeaders";
import { TreeTableHelper } from "./Helpers/TreeTableHelper";
import { TreeRowView, Indent } from "./TreeRow";

interface Props {
  treeTableHelper: TreeTableHelper;
  id?: string;
  serviceName?: string;
  version?: ParsedNumber;
  isExpertAvailable?: boolean;
}

export const TreeTable: React.FC<Props> = ({
  treeTableHelper,
  id,
  serviceName,
  version,
  isExpertAvailable = false,
}) => {
  const [expansionState, setExpansionState] = useState(
    treeTableHelper.getExpansionState()
  );
  const [isOpen, setIsOpen] = useState(false);
  const [firstColumn, ...columns] = treeTableHelper.getColumns();
  const { rows, closeAll, openAll } = treeTableHelper.createRows(
    expansionState,
    setExpansionState
  );
  const emptyColumns = treeTableHelper.getEmptyAttributeSets();

  return (
    <StyledTableComposable
      variant="compact"
      data-testid={id ? `attributes-tree-table-${id}` : "attributes-tree-table"}
    >
      <Thead>
        <StyledTr>
          <Th key={firstColumn} className="pf-m-width-40">
            <Indent level={0} noToggle>
              {firstColumn}
            </Indent>
          </Th>
          <ColumnHeaders columns={columns} emptyColumns={emptyColumns} />
          <Th>
            <Dropdown
              role="listbox"
              aria-label="expand-collapse-dropdown"
              onSelect={() => setIsOpen((value) => !value)}
              toggle={
                <StyledToggle onToggle={() => setIsOpen((value) => !value)} />
              }
              isOpen={isOpen}
              isPlain
              dropdownItems={[
                <DropdownItem
                  key="openAll"
                  component="button"
                  onClick={openAll}
                >
                  {words("inventory.tabs.expand")}
                </DropdownItem>,
                <DropdownItem
                  key="closeAll"
                  component="button"
                  onClick={closeAll}
                >
                  {words("inventory.tabs.collapse")}
                </DropdownItem>,
              ]}
              position="right"
            />
          </Th>
        </StyledTr>
      </Thead>
      <Tbody>
        {rows.map((row) => (
          <TreeRowView
            key={row.id}
            row={row}
            id={id as string}
            version={version as number}
            serviceEntity={serviceName as string}
            showExpertMode={isExpertAvailable}
          />
        ))}
      </Tbody>
    </StyledTableComposable>
  );
};

const StyledTableComposable = styled(TableComposable)`
  --pf-c-table__expandable-row--after--border-width--base: 0px;
`;
const StyledTr = styled(Tr)`
  --pf-c-table--cell--Overflow: visible;
`;
const StyledToggle = styled(KebabToggle)`
  --pf-c-dropdown__toggle--PaddingBottom: 0;
`;
