import React, { useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from "@patternfly/react-core";
import { EllipsisVIcon } from "@patternfly/react-icons";
import { Tbody, Thead, Tr, Th, Table } from "@patternfly/react-table";
import { words } from "@inmanta/web-console-core";
import { ColumnHeaders } from "./ColumnHeaders";
import { TreeTableHelper } from "./Helpers/TreeTableHelper";
import { TreeRowView } from "./TreeRow";

interface Props {
  treeTableHelper: TreeTableHelper;
}

export const TreeTable: React.FC<Props> = ({ treeTableHelper }) => {
  const [expansionState, setExpansionState] = useState(treeTableHelper.getExpansionState());
  const [isOpen, setIsOpen] = useState(false);
  const [firstColumn, ...columns] = treeTableHelper.getColumns();
  const { rows, closeAll, openAll } = treeTableHelper.createRows(expansionState, setExpansionState);

  return (
    <Table isTreeTable gridBreakPoint="" variant="compact">
      <Thead>
        <Tr>
          <Th key={firstColumn} width={30}>
            {firstColumn}
          </Th>
          <ColumnHeaders columns={columns} />
          <Th>
            <Dropdown
              role="listbox"
              aria-label="expand-collapse-dropdown"
              onSelect={() => setIsOpen((value) => !value)}
              onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  aria-label="expand-collapse-dropdown-toggle"
                  isExpanded={isOpen}
                  variant="plain"
                  onClick={() => setIsOpen((value) => !value)}
                  icon={<EllipsisVIcon />}
                />
              )}
              isOpen={isOpen}
              popperProps={{ position: "right" }}
            >
              <DropdownList>
                <DropdownItem key="openAll" component="button" onClick={openAll}>
                  {words("expandAll")}
                </DropdownItem>
                <DropdownItem key="closeAll" component="button" onClick={closeAll}>
                  {words("collapseAll")}
                </DropdownItem>
              </DropdownList>
            </Dropdown>
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((row, rowIndex) => (
          <TreeRowView key={row.id} row={row} rowIndex={rowIndex} />
        ))}
      </Tbody>
    </Table>
  );
};
