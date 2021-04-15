import React, { useState } from "react";
import {
  ToolbarItem,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  DropdownPosition,
} from "@patternfly/react-core";
import { FilterIcon } from "@patternfly/react-icons";

interface Props {
  filterKind: FilterKind;
  setFilterKind: (kind: FilterKind) => void;
}

export type FilterKind = "State" | "Id" | "AttributeSet";

export const FilterPicker: React.FC<Props> = ({
  filterKind,
  setFilterKind,
}) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const onCategorySelect = (newCategory: FilterKind) => {
    setFilterKind(newCategory);
    setIsCategoryOpen(false);
  };

  return (
    <ToolbarItem>
      <Dropdown
        onSelect={(event) => {
          onCategorySelect(
            (event?.target as HTMLElement).innerText as FilterKind
          );
        }}
        position={DropdownPosition.left}
        toggle={
          <DropdownToggle
            onToggle={setIsCategoryOpen}
            style={{ width: "100%" }}
          >
            <FilterIcon /> {filterKind}
          </DropdownToggle>
        }
        isOpen={isCategoryOpen}
        dropdownItems={[
          <DropdownItem key="cat1">State</DropdownItem>,
          <DropdownItem key="cat2">Id</DropdownItem>,
          <DropdownItem key="cat3">AttributeSet</DropdownItem>,
        ]}
        style={{ width: "100%" }}
      ></Dropdown>
    </ToolbarItem>
  );
};
