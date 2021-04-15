import React, { useState } from "react";
import { ToolbarFilter, Select, SelectOption } from "@patternfly/react-core";
import { toggleValueInList } from "@/Core";
import { uniq } from "lodash";

interface Props {
  isVisible: boolean;
  selectedStates: string[];
  possibleStates: string[];
  update: (state: string[]) => void;
}

export const StateFilter: React.FC<Props> = ({
  isVisible,
  selectedStates,
  possibleStates,
  update,
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
      categoryName="State"
      showToolbarItem={isVisible}
    >
      <Select
        aria-label="State"
        onToggle={setIsFilterOpen}
        onSelect={onSelect}
        selections={selectedStates}
        isOpen={isFilterOpen}
        placeholderText="Select a state..."
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
