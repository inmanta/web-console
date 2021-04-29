import React, { useState } from "react";
import { ToolbarFilter, Select, SelectOption } from "@patternfly/react-core";
import { toggleValueInList } from "@/Core";
import { uniq } from "lodash";

interface Props {
  filterPropertyName?: string;
  placeholder?: string;
  isVisible: boolean;
  selectedStates: string[];
  possibleStates: string[];
  update: (state: string[]) => void;
}

/** Selects one option from a list to be used as a filter */
export const SelectOptionFilter: React.FC<Props> = ({
  isVisible,
  selectedStates,
  possibleStates,
  update,
  filterPropertyName = "State",
  placeholder = "Select a state...",
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const onSelect = (event, selection) => {
    update(uniq(toggleValueInList(selection, selectedStates)));
    setIsFilterOpen(false);
  };

  const removeChip = (cat, id) => {
    update(selectedStates.filter((value) => value !== id));
  };

  return (
    <ToolbarFilter
      chips={selectedStates}
      deleteChip={removeChip}
      categoryName={filterPropertyName}
      showToolbarItem={isVisible}
    >
      <Select
        aria-label={filterPropertyName}
        onToggle={setIsFilterOpen}
        onSelect={onSelect}
        selections={selectedStates}
        isOpen={isFilterOpen}
        placeholderText={placeholder}
        variant="typeaheadmulti"
        chipGroupProps={{ numChips: 0 }}
      >
        {possibleStates.map((state) => (
          <SelectOption key={state} value={state} />
        ))}
      </Select>
    </ToolbarFilter>
  );
};
