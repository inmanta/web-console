import React, { useState } from "react";
import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectOption,
  ToolbarItem,
} from "@patternfly/react-core";
import { FilterIcon } from "@patternfly/react-icons";
import styled from "styled-components";

interface Props {
  filterKind: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFilterKind: (kind: any) => void;
  items: string[];
}

export const FilterPicker: React.FC<Props> = ({
  filterKind,
  setFilterKind,
  items,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const onSelect = (_event, selection) => {
    setIsOpen(false);
    setFilterKind(selection);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsOpen((value) => !value)}
      isExpanded={isOpen}
      aria-label={"FilterPicker"}
      style={
        {
          minWidth: "150px",
        } as React.CSSProperties
      }
    >
      <StyledIcon />
      {filterKind}
    </MenuToggle>
  );

  return (
    <StyledToolbarItem>
      <Select
        onSelect={onSelect}
        toggle={toggle}
        selected={filterKind}
        isOpen={isOpen}
        onOpenChange={(isOpen) => setIsOpen(isOpen)}
      >
        {items.map((item) => (
          <SelectOption key={item} value={item}>
            {item}
          </SelectOption>
        ))}
      </Select>
    </StyledToolbarItem>
  );
};

const StyledToolbarItem = styled(ToolbarItem)`
  align-self: start;
`;

const StyledIcon = styled(FilterIcon)`
  margin-right: 5px;
`;
