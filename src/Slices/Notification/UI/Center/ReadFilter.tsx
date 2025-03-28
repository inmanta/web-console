import React from "react";
import { SelectOptionProps, ToolbarFilter } from "@patternfly/react-core";
import { NotificationFilter } from "@/Data/Managers/V2/Notification/GetNotifications";
import { SingleTextSelect } from "@/UI/Components";
import { words } from "@/UI/words";

type Read = "read" | "unread";
const list: Read[] = ["read", "unread"];

interface Props {
  filter: NotificationFilter;
  setFilter: (filter: NotificationFilter) => void;
}

export const ReadFilter: React.FC<Props> = ({ filter, setFilter }) => {
  const options: SelectOptionProps[] = list.map((option) => {
    return { value: option, children: option };
  });
  const onSelect = (selection) => {
    setFilter({
      ...filter,
      read: selection === "" ? undefined : selection === "read",
    });
  };

  const deleteChip = () =>
    setFilter({
      ...filter,
      read: undefined,
    });

  return (
    <ToolbarFilter
      labels={filterToChips(filter)}
      deleteLabel={deleteChip}
      categoryName="Read"
    >
      <SingleTextSelect
        aria-label="ReadOptions"
        options={options}
        selected={filterToSelected(filter)}
        setSelected={onSelect}
        toggleAriaLabel="Read"
        placeholderText={words("notification.read.placeholder")}
      />
    </ToolbarFilter>
  );
};

const filterToSelected = (filter: NotificationFilter): Read | null => {
  switch (filter.read) {
    case undefined:
      return null;
    case true:
      return "read";
    case false:
      return "unread";
  }
};

const filterToChips = (filter: NotificationFilter): string[] => {
  switch (filter.read) {
    case undefined:
      return [];
    case true:
      return ["read"];
    case false:
      return ["unread"];
  }
};
