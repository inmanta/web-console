import React, { useState } from "react";
import { ToolbarItem } from "@patternfly/react-core";
import {
  Select,
  SelectVariant,
  SelectOption,
} from "@patternfly/react-core/deprecated";
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
  const [isFilterOpen, setFilterOpen] = useState(false);

  const onSelect = (event, selection) => {
    setFilterOpen(false);
    setFilterKind(selection);
  };

  return (
    <StyledToolbarItem>
      <Select
        variant={SelectVariant.single}
        toggleAriaLabel="FilterPicker"
        onToggle={(_event, val) => setFilterOpen(val)}
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
    </StyledToolbarItem>
  );
};

const StyledToolbarItem = styled(ToolbarItem)`
  align-self: start;
`;
