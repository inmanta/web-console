import React, { useState } from "react";
import {
  ToolbarItem,
  Select,
  SelectVariant,
  SelectOption,
} from "@patternfly/react-core";
import { FilterIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { DesiredStateParams } from "@/Core";

interface Props {
  filterKind: DesiredStateParams.Kind | string;
  setFilterKind: (kind: DesiredStateParams.Kind) => void;
}

export const FilterPicker: React.FC<Props> = ({
  filterKind,
  setFilterKind,
}) => {
  const [isFilterOpen, setFilterOpen] = useState(false);

  const onSelect = (event, selection) => {
    setFilterOpen(false);
    setFilterKind(selection as DesiredStateParams.Kind);
  };

  const items = DesiredStateParams.List;

  return (
    <StyledToolbarItem>
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
    </StyledToolbarItem>
  );
};

const StyledToolbarItem = styled(ToolbarItem)`
  align-self: start;
`;
