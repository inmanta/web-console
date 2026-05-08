import React, { useState } from "react";
import {
  Badge,
  Content,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Icon,
  MenuToggle,
  Tooltip,
} from "@patternfly/react-core";
import { DragDropSort, DraggableObject } from "@patternfly/react-drag-drop";
import { SortAmountDownIcon, SortAmountUpIcon } from "@patternfly/react-icons";
import { Resource } from "@/Core";
import { MultiSort, toggleMulti } from "@/Data";
import { words } from "@/UI";

interface Props {
  sort: MultiSort<Resource.SortKey>;
  setSort: (sort: MultiSort<Resource.SortKey>) => void;
}

/**
 * The StatusSortMenu component.
 *
 * Provides a dropdown menu for managing status-based sorting rules, including:
 * - Enabling/disabling status sort keys
 * - Reordering active sort keys via drag-and-drop
 * - Toggling sort direction (ascending/descending) for each active key
 *
 * The component visually separates active and inactive sort keys and displays
 * the number of active sorts in a badge on the toggle button.
 *
 * @Props {Props} - Component props.
 *  @prop {MultiSort<Resource.SortKey>} sort
 *  - The current multi-sort configuration applied to the resource list.
 *
 *  @prop {(sort: MultiSort<Resource.SortKey>) => void} setSort
 *  - Callback used to update the sort configuration.
 *
 * @returns {React.ReactElement} The rendered status sort dropdown menu.
 */

export const StatusSortMenu: React.FC<Props> = ({ sort, setSort }): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);

  const activeStatusSorts: MultiSort<Resource.StatusSortKey> = sort.filter(
    (sortEntry): sortEntry is MultiSort<Resource.StatusSortKey>[number] =>
      Resource.isStatusSortKey(sortEntry.name)
  );
  const inactiveItems = Resource.STATUS_SORT_KEYS.filter(
    (key) => !activeStatusSorts.some((sortEntry) => sortEntry.name === key)
  );

  const activeCount = activeStatusSorts.length;

  const getLabel = (key: Resource.StatusSortKey) => words(`resources.sort.label.${key}`);

  const onToggle = (key: Resource.StatusSortKey) => {
    setSort(toggleMulti(activeStatusSorts, key));
  };

  const draggableItems: DraggableObject[] = activeStatusSorts.map((sortEntry) => ({
    id: sortEntry.name,
    content: (
      <Flex
        key={sortEntry.name}
        justifyContent={{ default: "justifyContentSpaceBetween" }}
        alignItems={{ default: "alignItemsCenter" }}
        data-testid="status-sort-item"
        data-key={sortEntry.name}
        data-order={sortEntry.order}
        onClick={(event) => {
          event.stopPropagation();
          onToggle(sortEntry.name);
        }}
        style={{ paddingLeft: 4, paddingRight: 12, height: "100%" }}
      >
        <FlexItem>{getLabel(sortEntry.name)}</FlexItem>
        <FlexItem>
          <Icon status="info" isInline>
            {sortEntry.order === "desc" ? <SortAmountDownIcon /> : <SortAmountUpIcon />}
          </Icon>
        </FlexItem>
      </Flex>
    ),
  }));

  const onDrop = (_, newItems: DraggableObject[]) => {
    const reordered = newItems.map(
      (item) => activeStatusSorts.find((sortEntry) => sortEntry.name === item.id)!
    );
    setSort(reordered);
  };

  return (
    <Tooltip content={words("resources.column.status.toolTip")}>
      <Dropdown
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        popperProps={{ position: "center" }}
        style={{ width: "300px" }}
        toggle={(toggleRef) => (
          <MenuToggle
            ref={toggleRef}
            variant="plain"
            className="pf-v6-c-table__button"
            onClick={() => setIsOpen((prev) => !prev)}
            isExpanded={isOpen}
            aria-label="Sort by status fields"
            badge={
              <Badge isRead data-testid="status-sort-badge">
                {activeCount}
              </Badge>
            }
          >
            {words("resources.column.status")}
          </MenuToggle>
        )}
      >
        <DropdownList data-testid="status-sort-menu">
          {activeStatusSorts.length > 0 && (
            <Content data-testid="status-sort-active-list">
              <DragDropSort
                items={draggableItems}
                onDrop={onDrop}
                variant="DualListSelectorList"
                data-testid="status-sort-active-list"
              />
            </Content>
          )}

          {inactiveItems.length > 0 && activeStatusSorts.length > 0 && <Divider component="li" />}

          {inactiveItems.map((key) => (
            <DropdownItem key={key} itemId={key} onClick={() => onToggle(key)}>
              {getLabel(key)}
            </DropdownItem>
          ))}
        </DropdownList>
      </Dropdown>
    </Tooltip>
  );
};
