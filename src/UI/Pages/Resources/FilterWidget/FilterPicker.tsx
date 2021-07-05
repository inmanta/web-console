import React, { useState } from "react";
import {
  ToolbarItem,
  Select,
  SelectVariant,
  SelectOption,
} from "@patternfly/react-core";
import { LatestReleasedResourceParams } from "@/Core";
import { FilterIcon } from "@patternfly/react-icons";

interface Props {
  filterKind: LatestReleasedResourceParams.Kind | string;
  setFilterKind: (kind: LatestReleasedResourceParams.Kind) => void;
}

export const FilterPicker: React.FC<Props> = ({
  filterKind,
  setFilterKind,
}) => {
  const [isFilterOpen, setFilterOpen] = useState(false);

  const onSelect = (event, selection) => {
    setFilterOpen(false);
    setFilterKind(selection as LatestReleasedResourceParams.Kind);
  };

  const items = LatestReleasedResourceParams.List;

  return (
    <ToolbarItem>
      <Select
        variant={SelectVariant.single}
        aria-label="FilterPicker"
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
