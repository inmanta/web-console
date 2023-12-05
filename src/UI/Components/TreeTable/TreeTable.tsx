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
    treeTableHelper.getExpansionState(),
  );
  const [isOpen, setIsOpen] = useState(false);
  const [firstColumn, ...columns] = treeTableHelper.getColumns();
  const { rows, closeAll, openAll } = treeTableHelper.createRows(
    expansionState,
    setExpansionState,
  );
  const emptyColumns = treeTableHelper.getEmptyAttributeSets();

  return (
    <StyledTableComposable
      variant="compact"
      data-testid={id ? `attributes-tree-table-${id}` : "attributes-tree-table"}
    >
      <Thead>
        <StyledTr>
          <Th key={firstColumn} className="pf-v5-m-width-40">
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
              onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  aria-label="expand-collapse-dropdown-toggle"
                  isExpanded={isOpen}
                  variant="plain"
                  onClick={() => setIsOpen((value) => !value)}
                >
                  <EllipsisVIcon />
                </MenuToggle>
              )}
              isOpen={isOpen}
              popperProps={{ position: "right" }}
            >
              <DropdownList>
                <DropdownItem
                  key="openAll"
                  component="button"
                  onClick={openAll}
                >
                  {words("inventory.tabs.expand")}
                </DropdownItem>
                <DropdownItem
                  key="closeAll"
                  component="button"
                  onClick={closeAll}
                >
                  {words("inventory.tabs.collapse")}
                </DropdownItem>
              </DropdownList>
            </Dropdown>
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
            attributes={treeTableHelper.getAttributes()}
          />
        ))}
      </Tbody>
    </StyledTableComposable>
  );
};

const StyledTableComposable = styled(Table)`
  --pf-v5-c-table__expandable-row--after--border-width--base: 0px;
`;
const StyledTr = styled(Tr)`
  --pf-v5-c-table--cell--Overflow: visible;
`;
