import React, { useState } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import {
  Badge,
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Icon,
  Tooltip,
} from "@patternfly/react-core";
import { DragDropSort, DraggableObject } from "@patternfly/react-drag-drop";
import { SortAmountDownIcon, SortAmountUpIcon } from "@patternfly/react-icons";
import { Resource, Sort } from "@/Core";
import { words } from "@/UI";
import "./StatusSortMenu.css";

interface StatusSortItem {
  label: string;
  key: Resource.StatusSortKey;
}

const STATUS_SORT_ITEMS: StatusSortItem[] = [
  { label: "Blocked", key: "blocked" },
  { label: "Compliance", key: "compliance" },
  { label: "Last Handler Run", key: "lastHandlerRun" },
  { label: "Is Deploying", key: "isDeploying" },
];
export const STATUS_SORT_KEYS = STATUS_SORT_ITEMS.map((i) => i.key);

interface Props {
  sort: Sort.MultiSort<Resource.SortKey>;
  setSort: (sort: Sort.MultiSort<Resource.SortKey>) => void;
}

/**
 * The StatusSortMenu component.
 *
 * This component is responsible for displaying and managing sortable conpound status-based
 * columns within a dropdown menu. It allows users to:
 * - Enable/disable specific status sort keys
 * - Reorder active status sorts via drag-and-drop
 * - Toggle sort direction (ascending/descending) by clicking an item
 *
 * Active sorts are shown in a draggable list, while inactive sorts are shown as
 * simple selectable menu items.
 *
 * @Props {Props} - Component props.
 *  @prop {Sort.MultiSort<Resource.SortKey>} sort - Current multi-sort state containing all active and inactive sort definitions.
 *  @prop {(sort: Sort.MultiSort<Resource.SortKey>) => void} setSort - Callback to update the sort state.
 *
 * @returns {React.ReactElement} The rendered status sort dropdown menu.
 */
export const StatusSortMenu: React.FC<Props> = ({ sort, setSort }) => {
  //todo check overlayProps
  const [isOpen, setIsOpen] = useState(false);

  const activeStatusSorts = sort.filter((s) =>
    STATUS_SORT_KEYS.includes(s.name as Resource.StatusSortKey)
  );
  const inactiveItems = STATUS_SORT_ITEMS.filter(
    (item) => !activeStatusSorts.some((s) => s.name === item.key)
  );

  const activeCount = activeStatusSorts.length;

  const onToggle = (key: Resource.StatusSortKey) => {
    setSort(Sort.toggleMulti(sort, key));
  };

  const onDragFinish = (_event: DragEndEvent, newOrder: DraggableObject[]) => {
    const reorderedStatusSorts = newOrder.map(
      (item) => activeStatusSorts.find((s) => s.name === item.id)!
    );
    const nonStatusSorts = sort.filter(
      (s) => !STATUS_SORT_KEYS.includes(s.name as Resource.StatusSortKey)
    );

    setSort([...nonStatusSorts, ...reorderedStatusSorts]);
  };

  const draggableItems: DraggableObject[] = activeStatusSorts.map((s) => {
    const label = STATUS_SORT_ITEMS.find((item) => item.key === s.name)?.label ?? s.name;
    const SortIcon = s.order === "desc" ? SortAmountDownIcon : SortAmountUpIcon;

    return {
      id: s.name,
      content: (
        <Flex
          justifyContent={{ default: "justifyContentSpaceBetween" }}
          alignItems={{ default: "alignItemsCenter" }}
          flexWrap={{ default: "nowrap" }}
          style={{ width: "100%", cursor: "pointer" }}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(s.name as Resource.StatusSortKey);
          }}
        >
          <FlexItem>{label}</FlexItem>
          <FlexItem>
            <Icon status="info">
              <SortIcon />
            </Icon>
          </FlexItem>
        </Flex>
      ),
    };
  });

  return (
    <Tooltip content={words("resources.column.status.toolTip")}>
      <Dropdown
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        toggle={(toggleRef) => (
          <Button
            ref={toggleRef}
            variant="plain"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={words("resources.column.status")}
            aria-expanded={isOpen}
            style={{
              fontWeight: 600,
              fontSize: "inherit",
              position: "absolute",
              bottom: 0,
              right: 22,
            }}
          >
            <Flex
              alignItems={{ default: "alignItemsCenter" }}
              flexWrap={{ default: "nowrap" }}
              gap={{ default: "gapSm" }}
            >
              <FlexItem>{words("resources.column.status")}</FlexItem>
              <FlexItem>
                <Badge isRead>{activeCount}</Badge>
              </FlexItem>
            </Flex>
          </Button>
        )}
        popperProps={{ position: "center" }}
      >
        <DropdownList
          style={{ display: "flex", flexDirection: "column", gap: "6px", width: "220px" }}
        >
          {/* Active sorts — draggable to reorder */}
          {activeStatusSorts.length > 0 && (
            <div className="statusSortDragWrapper">
              <DragDropSort items={draggableItems} onDrop={onDragFinish} variant="default" />
            </div>
          )}

          {inactiveItems.length > 0 && activeStatusSorts.length > 0 && <Divider />}

          {/* Inactive items — plain clickable rows */}
          <div>
            {inactiveItems.map(({ label, key }) => (
              <DropdownItem key={key} onClick={() => onToggle(key)}>
                <Flex
                  justifyContent={{ default: "justifyContentSpaceBetween" }}
                  flexWrap={{ default: "nowrap" }}
                >
                  <FlexItem>{label}</FlexItem>
                </Flex>
              </DropdownItem>
            ))}
          </div>
        </DropdownList>
      </Dropdown>
    </Tooltip>
  );
};
