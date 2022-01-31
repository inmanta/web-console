import React, { useState } from "react";
import {
  ToolbarItem,
  Select,
  SelectVariant,
  SelectOption,
} from "@patternfly/react-core";
import { FilterIcon } from "@patternfly/react-icons";
import { GetParameters } from "@/Core";

interface Props {
  filterKind: GetParameters.FilterKind | string;
  setFilterKind: (kind: GetParameters.FilterKind) => void;
}

export const FilterPicker: React.FC<Props> = ({
  filterKind,
  setFilterKind,
}) => {
  const [isFilterOpen, setFilterOpen] = useState(false);

  const onSelect = (event, selection) => {
    setFilterOpen(false);
    setFilterKind(selection as GetParameters.FilterKind);
  };

  const items = GetParameters.FilterList;

  return (
    <ToolbarItem>
      <Select
        variant={SelectVariant.single}
        toggleAriaLabel="FilterPicker"
        onToggle={setFilterOpen}
        onSelect={onSelect}
        toggleIcon={<FilterIcon />}
        selections={filterKind}
        isOpen={isFilterOpen}
      >
        {items.map((item) => (
          <SelectOption key={item} value={item}>
            {item}
          </SelectOption>
        ))}
      </Select>
    </ToolbarItem>
  );
};
