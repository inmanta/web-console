import React, { useState } from "react";
import {
  Badge,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Icon,
  MenuItemAction,
  MenuToggle,
  Tooltip,
} from "@patternfly/react-core";
import {
  AngleDownIcon,
  AngleUpIcon,
  SortAmountDownIcon,
  SortAmountUpIcon,
} from "@patternfly/react-icons";
import { Resource } from "@/Core";
import { MultiSort, toggleMulti } from "@/Data";
import { words } from "@/UI";

interface Props {
  sort: MultiSort<Resource.SortKey>;
  setSort: (sort: MultiSort<Resource.SortKey>) => void;
}

export const StatusSortMenu: React.FC<Props> = ({ sort, setSort }): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);

  const activeStatusSorts = sort.filter((sortEntry) =>
    Resource.STATUS_SORT_KEYS.includes(sortEntry.name as Resource.StatusSortKey)
  );
  const inactiveItems = Resource.STATUS_SORT_ITEMS.filter(
    (item) => !activeStatusSorts.some((sortEntry) => sortEntry.name === item.key)
  );
  const activeCount = activeStatusSorts.length;

  const onToggle = (key: Resource.StatusSortKey) => {
    setSort(toggleMulti(activeStatusSorts, key));
  };

  const moveUp = (index: number) => {
    const next = [...activeStatusSorts];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setSort(next);
  };

  const moveDown = (index: number) => {
    const next = [...activeStatusSorts];
    [next[index + 1], next[index]] = [next[index], next[index + 1]];
    setSort(next);
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
          <DropdownList data-testid="status-sort-active-list">
            {activeStatusSorts.map((sortEntry, index) => {
              const label =
                Resource.STATUS_SORT_ITEMS.find((item) => item.key === sortEntry.name)?.label ??
                sortEntry.name;
              const SortIcon = sortEntry.order === "desc" ? SortAmountDownIcon : SortAmountUpIcon;

              return (
                <DropdownItem
                  key={sortEntry.name}
                  itemId={sortEntry.name}
                  data-testid="status-sort-item"
                  data-key={sortEntry.name}
                  onClick={() => onToggle(sortEntry.name as Resource.StatusSortKey)}
                  actions={
                    <>
                      <MenuItemAction
                        icon={<AngleUpIcon />}
                        aria-label="Move up"
                        isDisabled={index === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveUp(index);
                        }}
                      />
                      <MenuItemAction
                        icon={<AngleDownIcon />}
                        aria-label="Move down"
                        isDisabled={index === activeStatusSorts.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveDown(index);
                        }}
                      />
                      <MenuItemAction
                        icon={
                          <Icon status="info">
                            <SortIcon />
                          </Icon>
                        }
                        aria-label="Toggle sort direction"
                        data-direction={sortEntry.order}
                        data-testid="sort-direction-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggle(sortEntry.name as Resource.StatusSortKey);
                        }}
                      />
                    </>
                  }
                >
                  {label}
                </DropdownItem>
              );
            })}
          </DropdownList>

          {inactiveItems.length > 0 && activeStatusSorts.length > 0 && <Divider component="li" />}

          {inactiveItems.map(({ label, key }) => (
            <DropdownItem key={key} itemId={key} onClick={() => onToggle(key)}>
              {label}
            </DropdownItem>
          ))}
        </DropdownList>
      </Dropdown>
    </Tooltip>
  );
};
