import React from "react";
import { SelectOptionProps, ToolbarFilter } from "@patternfly/react-core";
import { SingleTextSelect } from "@/UI/Components";
import { words } from "@/UI/words";
import { Filter } from "@S/Notification/Core/Query";

type Read = "read" | "unread";
const list: Read[] = ["read", "unread"];

interface Props {
  filter: Filter;
  setFilter: (filter: Filter) => void;
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
      chips={filterToChips(filter)}
      deleteChip={deleteChip}
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

const filterToSelected = (filter: Filter): Read | null => {
  switch (filter.read) {
    case undefined:
      return null;
    case true:
      return "read";
    case false:
      return "unread";
  }
};

const filterToChips = (filter: Filter): string[] => {
  switch (filter.read) {
    case undefined:
      return [];
    case true:
      return ["read"];
    case false:
      return ["unread"];
  }
};
