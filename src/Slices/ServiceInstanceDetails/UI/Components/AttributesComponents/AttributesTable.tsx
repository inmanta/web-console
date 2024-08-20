import React, { useEffect, useState } from "react";
import {
  FormSelect,
  FormSelectOption,
  Flex,
  FlexItem,
  MenuToggleElement,
  MenuToggle,
  Dropdown,
  DropdownList,
  DropdownItem,
} from "@patternfly/react-core";
import { EllipsisVIcon } from "@patternfly/react-icons";
import {
  Table,
  Thead,
  Tr,
  Th,
  TdProps,
  TreeRowWrapper,
  Td,
  Tbody,
  TableText,
  ThProps,
} from "@patternfly/react-table";
import styled from "styled-components";
import { InstanceAttributeModel } from "@/Core";
import { words } from "@/UI";
import {
  AttributeSets,
  formatTreeRowData,
  sortTreeRows,
  TreeRowData,
} from "./Utils";

interface Props {
  dropdownOptions: string[];
  attributeSets: Partial<Record<AttributeSets, InstanceAttributeModel>>;
}

/**
 * The AttributesTable Component.
 *
 * This component is responsible of displaying the correct data in a TreeRowTable.
 * It allows the user to select the attributeSet (Candidate, Active, Rollback) to display
 * It has a dropdown menu to expand/collapse all rows.
 *
 * @Props {Props} - The props of the component
 *  @prop {string[]} dropdownOptions - The dropdownOptions for the AttributeSetSelection
 *  @prop {Partial<Record<AttributeSets, InstanceAttributeModel>>} attributeSets - The attributeSets available for the selected version.
 * @returns {React.FC<Props>} A React Component displaying the Attributes in a TreeRowTable
 */
export const AttributesTable: React.FC<Props> = ({
  dropdownOptions,
  attributeSets,
}) => {
  const [selectedSet, setSelectedSet] = useState(dropdownOptions[0]);
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([""]);

  // Sort direction of the currently sorted column
  const [activeSortDirection, setActiveSortDirection] = useState<
    "asc" | "desc" | undefined
  >();
  const [activeSortIndex, setActiveSortIndex] = useState<number | undefined>();

  // expandedDetailsNodeIds is used for the responsive view of the TreeTable.
  const [expandedDetailsNodeIds, setExpandedDetailsNodeIds] = useState<
    string[]
  >([""]);
  const [tableData, setTableData] = useState<TreeRowData[]>([]);
  const [isToggleOpen, setIsToggleOpen] = useState(false);

  /**
   * Get the sorting parameters according to PF guidelines.
   *
   * @param {number} columnIndex - defaults to 1, since we only have one sortable header atm.
   * @returns ThProps["sort"]
   */
  const getSortParams = (columnIndex: number = 1): ThProps["sort"] => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection,
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  /**
   * Handles the change of the selected attribute Set.
   *
   * @param {React.FormEvent<HTMLSelectElement>} _event
   * @param {string} value
   */
  const onSetSelectionChange = (
    _event: React.FormEvent<HTMLSelectElement>,
    value: string,
  ) => {
    setSelectedSet(value);
  };

  /**
   * Handle the toggleClick event on the table option toggle.
   */
  const onToggleClick = () => {
    setIsToggleOpen(!isToggleOpen);
  };

  /**
   * Method to handle the displayed value of the treeRowCell.
   *
   * We don't want to show a value when the row contains expandable content
   * We also want to display dicts and numbers correctly, these values are stringified.
   *
   * @param {TreeRowData} treeRowCell - The data of the treeRowCell
   * @returns {string} - The stringified value or an empty string when the row has further nested children.
   */
  const printValue = (treeRowCell: TreeRowData): string => {
    if (!treeRowCell.children || treeRowCell.children.length === 0) {
      if (typeof treeRowCell.value === "string") {
        return treeRowCell.value;
      } else {
        return JSON.stringify(treeRowCell.value);
      }
    }

    return "";
  };

  /**
   * Handle the select event of the table options dropdown.
   * Current handled options are:
   *
   * Expand-all
   * Collapse-all
   * Reset-sort
   *
   * @param {React.MouseEvent<Element, MouseEvent>} _event
   * @param {string | number | undefined} value
   */
  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    switch (value) {
      case "Expand-all":
        expandAll();
        break;
      case "Collapse-all":
        collapseAll();
        break;
      case "Reset-sort":
        setTableData(formatTreeRowData(attributeSets[selectedSet]));
        break;
      default:
        break;
    }
    setIsToggleOpen(false);
  };

  /**
   * Method to collapse all the rows in the TreeTable.
   */
  const collapseAll = () => {
    setExpandedNodeIds([""]);
    setExpandedDetailsNodeIds([""]);
  };

  /**
   * Method to expand all the rows in the TreeTable.
   */
  const expandAll = () => {
    const idsToExpand: string[] = [];

    const traverse = (nodes: TreeRowData[]) => {
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          // add the id to the expansion list
          idsToExpand.push(node.id);

          // recursively handle the children
          traverse(node.children);
        }
      }
    };

    // start traversal from the root
    traverse(tableData);

    // replace the old expanded items with the new array
    setExpandedNodeIds(idsToExpand);
  };

  /**
   * Toggle Element for the table options
   *
   * @param {React.Ref<MenuToggleElement>} toggleRef - the toggleRef
   * @returns {React.FC} A React Component for the dropdown toggle.
   */
  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      aria-label="table-options"
      variant="plain"
      onClick={onToggleClick}
      isExpanded={isToggleOpen}
    >
      <EllipsisVIcon />
    </MenuToggle>
  );

  /**
   * Recursive function which flattens the data into an array of flattened TreeRowWrapper components
   * params:
   * - nodes - array of a single level of tree nodes
   * - level - number representing how deeply nested the current row is
   * - posinset - position of the row relative to this row's siblings
   * - currentRowIndex - position of the row relative to the entire table
   * - isHidden - defaults to false, true if this row's parent is expanded
   */
  const renderRows = (
    [node, ...remainingNodes]: TreeRowData[],
    level = 1,
    posinset = 1,
    rowIndex = 0,
    isHidden = false,
  ): React.ReactNode[] => {
    if (!node) {
      return [];
    }

    const isExpanded = expandedNodeIds.includes(node.id);

    // isDetailsExpanded is used only on the responsive view.
    const isDetailsExpanded = expandedDetailsNodeIds.includes(node.id);

    const treeRow: TdProps["treeRow"] = {
      onCollapse: () =>
        setExpandedNodeIds((prevExpanded) => {
          const otherExpandedNodeNames = prevExpanded.filter(
            (id) => id !== node.id,
          );

          return isExpanded
            ? otherExpandedNodeNames
            : [...otherExpandedNodeNames, node.id];
        }),
      onToggleRowDetails: () =>
        setExpandedDetailsNodeIds((prevDetailsExpanded) => {
          const otherDetailsExpandedNodeNames = prevDetailsExpanded.filter(
            (id) => id !== node.id,
          );

          return isDetailsExpanded
            ? otherDetailsExpandedNodeNames
            : [...otherDetailsExpandedNodeNames, node.id];
        }),
      rowIndex,
      props: {
        isExpanded,
        isDetailsExpanded,
        isHidden,
        "aria-level": level,
        "aria-posinset": posinset,
        "aria-setsize": node.children ? node.children.length : 0,
      },
    };

    const childRows =
      node.children && node.children.length
        ? renderRows(
            node.children,
            level + 1,
            1,
            rowIndex + 1,
            !isExpanded || isHidden,
          )
        : [];

    return [
      <TreeRowWrapper key={rowIndex} row={{ props: treeRow.props }}>
        <Td dataLabel="name" treeRow={treeRow}>
          <TableText>{node.name}</TableText>
        </Td>
        <Td dataLabel="value" width={60}>
          <TableText wrapModifier="truncate">{printValue(node)}</TableText>
        </Td>
      </TreeRowWrapper>,
      ...childRows,
      ...renderRows(
        remainingNodes,
        level,
        posinset + 1,
        rowIndex + 1 + childRows.length,
        isHidden,
      ),
    ];
  };

  useEffect(() => {
    setTableData(formatTreeRowData(attributeSets[selectedSet]));
  }, [attributeSets, selectedSet]);

  useEffect(() => {
    // When the version changes, it can happen that the selectedSet isn't available in the dropdown.
    // In that case, we want to fall back to the first option available.
    if (!dropdownOptions.includes(selectedSet)) {
      setSelectedSet(dropdownOptions[0]);
    }
  }, [dropdownOptions, selectedSet]);

  useEffect(() => {
    if (activeSortDirection) {
      setTableData((prevTableData) =>
        sortTreeRows(prevTableData, activeSortDirection),
      );
    }
  }, [activeSortDirection]);

  return (
    <>
      <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
        <FlexItem>
          <StyledSelect
            value={selectedSet}
            onChange={onSetSelectionChange}
            aria-label="Select-AttributeSet"
            ouiaId="Select-AttributeSet"
          >
            {dropdownOptions.map((option, index) => (
              <FormSelectOption
                value={option}
                key={index}
                label={words(option as AttributeSets)}
              />
            ))}
          </StyledSelect>
        </FlexItem>
        <FlexItem>
          <Dropdown
            isOpen={isToggleOpen}
            toggle={toggle}
            onOpenChange={(isOpen: boolean) => setIsToggleOpen(isOpen)}
            onSelect={onSelect}
          >
            <DropdownList>
              <DropdownItem value="Collapse-all" key="Collapse-all">
                Collapse all
              </DropdownItem>
              <DropdownItem value="Expand-all" key="Expand-all">
                Expand all
              </DropdownItem>
              <DropdownItem value="Reset-sort" key="Reset-sort">
                Reset Sorting
              </DropdownItem>
            </DropdownList>
          </Dropdown>
        </FlexItem>
      </Flex>

      <Table isTreeTable aria-label="Attributes-Table" variant="compact">
        <Thead>
          <Tr>
            <Th
              sort={getSortParams()}
              info={{
                tooltip: "The sorting can be resetted in the table options.",
              }}
            >
              Attribute
            </Th>
            <Th>Value</Th>
          </Tr>
        </Thead>
        <Tbody>{renderRows(tableData)}</Tbody>
      </Table>
    </>
  );
};

const StyledSelect = styled(FormSelect)`
  width: 180px;
  margin-top: var(--pf-v5-global--spacer--md);
`;
