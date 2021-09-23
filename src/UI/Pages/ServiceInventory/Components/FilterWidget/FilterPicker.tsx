import React, { useState } from "react";
import {
  ToolbarItem,
  Select,
  SelectVariant,
  SelectOption,
} from "@patternfly/react-core";
import { ServiceInstanceParams } from "@/Core";
import { FilterIcon } from "@patternfly/react-icons";

interface Props {
  filterKind: ServiceInstanceParams.Kind | string;
  setFilterKind: (kind: ServiceInstanceParams.Kind) => void;
  identityAttributePretty?: string;
}

export const FilterPicker: React.FC<Props> = ({
  filterKind,
  setFilterKind,
  identityAttributePretty,
}) => {
  const [isFilterOpen, setFilterOpen] = useState(false);

  const onSelect = (event, selection) => {
    setFilterOpen(false);
    setFilterKind(selection as ServiceInstanceParams.Kind);
  };

  const items = identityAttributePretty
    ? [...ServiceInstanceParams.List, identityAttributePretty]
    : ServiceInstanceParams.List;

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
