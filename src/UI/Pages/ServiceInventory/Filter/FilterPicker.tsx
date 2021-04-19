import React, { useState } from "react";
import {
  ToolbarItem,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  DropdownPosition,
} from "@patternfly/react-core";
import { FilterIcon } from "@patternfly/react-icons";
import { ServiceInstanceParams } from "@/Core";

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

  const onSelect = (kind: ServiceInstanceParams.Kind) => {
    setFilterOpen(false);
    setFilterKind(kind);
  };

  const items = identityAttributePretty
    ? [...ServiceInstanceParams.List, identityAttributePretty]
    : ServiceInstanceParams.List;

  return (
    <ToolbarItem>
      <Dropdown
        onSelect={(event) => {
          onSelect(
            (event?.target as HTMLElement)
              .innerText as ServiceInstanceParams.Kind
          );
        }}
        position={DropdownPosition.left}
        toggle={
          <DropdownToggle
            onToggle={setFilterOpen}
            style={{ width: "100%" }}
            aria-label="FilterPicker"
          >
            <FilterIcon /> {filterKind}
          </DropdownToggle>
        }
        isOpen={isFilterOpen}
        dropdownItems={items.map((kind) => (
          <DropdownItem key={kind}>{kind}</DropdownItem>
        ))}
        style={{ width: "100%" }}
      ></Dropdown>
    </ToolbarItem>
  );
};
