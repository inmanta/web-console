import React, { useMemo, useRef, useState } from "react";
import {
  Badge,
  DataList,
  DataListCell,
  DataListItemCells,
  Icon,
  Menu,
  MenuContainer,
  MenuToggle,
  Tooltip,
} from "@patternfly/react-core";
import { DragDropSort, DraggableObject } from "@patternfly/react-drag-drop";
import { SortAmountDownIcon, SortAmountUpIcon } from "@patternfly/react-icons";
import { Resource } from "@/Core";
import { MultiSort, toggleMulti } from "@/Data";
import { words } from "@/UI";

const getLabel = (key: Resource.StatusSortKey) => words(`resources.sort.label.${key}`);

/**
 * Reorders active status sorts to match a new key order (e.g. after drag-and-drop).
 * Inactive keys in `newOrder` are silently ignored.
 *
 * @param newOrder - The desired key order.
 * @param activeStatusSorts - The current active sorts to reorder.
 * @returns A new MultiSort array in the specified order, containing only active entries.
 */
export const reorderSorts = (
  newOrder: Resource.StatusSortKey[],
  activeStatusSorts: MultiSort<Resource.StatusSortKey>
): MultiSort<Resource.StatusSortKey> =>
  newOrder.flatMap((id) => {
    const match = activeStatusSorts.find((entry) => entry.name === id);
    return match ? [match] : [];
  });

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
 * The component visually groups active and inactive sort keys and displays
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
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const sortStatus = useMemo(
    () =>
      sort.filter((entry): entry is MultiSort<Resource.StatusSortKey>[number] =>
        Resource.isStatusSortKey(entry.name)
      ),
    [sort]
  );

  const activeSortStatus = sortStatus.map((entry) => entry.name);
  const inactiveSortStatus = Resource.STATUS_SORT_KEYS.filter(
    (key) => !activeSortStatus.includes(key)
  );
  const itemOrder = [...activeSortStatus, ...inactiveSortStatus];

  const handleToggle = (key: Resource.StatusSortKey) => {
    setSort(toggleMulti(sortStatus, key));
  };

  const onDrop = (_: unknown, newItems: DraggableObject[]) => {
    const newOrder = newItems.map((item) => item.id as Resource.StatusSortKey);
    setSort(reorderSorts(newOrder, sortStatus));
  };

  const items = itemOrder.map((key) => {
    const activeEntry = sortStatus.find((entry) => entry.name === key);
    const isActive = Boolean(activeEntry);

    return {
      id: key,
      props: {
        "data-order": activeEntry?.order,
        "data-testid": `status-sort-item-${key}-${isActive ? "active" : "inactive"}`,
      },
      content: (
        <DataListItemCells
          dataListCells={[
            <DataListCell
              key={`label-${key}`}
              style={{ cursor: "pointer", opacity: isActive ? 1 : 0.5 }}
              onClick={(event) => {
                event.stopPropagation();
                handleToggle(key);
              }}
            >
              {getLabel(key)}
            </DataListCell>,
            isActive && (
              <DataListCell
                key={`sort-icon-${key}`}
                isFilled={false}
                style={{ cursor: "pointer" }}
                onClick={(event) => {
                  event.stopPropagation();
                  handleToggle(key);
                }}
              >
                <Icon status="info" isInline>
                  {activeEntry?.order === "desc" ? <SortAmountDownIcon /> : <SortAmountUpIcon />}
                </Icon>
              </DataListCell>
            ),
          ]}
        />
      ),
    };
  });

  const toggle = (
    <MenuToggle
      ref={toggleRef}
      variant="plain"
      className="pf-v6-c-table__button"
      onClick={() => setIsOpen((prev) => !prev)}
      isExpanded={isOpen}
      aria-label="Sort by status fields"
      badge={
        <Badge isRead data-testid="status-sort-badge">
          {sortStatus.length}
        </Badge>
      }
    >
      {words("resources.column.status")}
    </MenuToggle>
  );

  const menu = (
    <Menu ref={menuRef} style={{ width: "250px" }}>
      <DragDropSort
        items={items}
        onDrop={onDrop}
        variant="DataList"
        overlayProps={{ isCompact: true }}
      >
        <DataList aria-label="draggable-sort-items" isCompact />
      </DragDropSort>
    </Menu>
  );

  return (
    <Tooltip content={words("resources.column.status.toolTip")}>
      <MenuContainer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        toggleRef={toggleRef}
        toggle={toggle}
        menuRef={menuRef}
        menu={menu}
        popperProps={{ position: "center" }}
      />
    </Tooltip>
  );
};
