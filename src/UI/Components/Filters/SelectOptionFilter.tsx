import React, { useState } from "react";
import { ToolbarFilter } from "@patternfly/react-core";
import { Select, SelectOption } from "@patternfly/react-core/deprecated";
import { SearchIcon } from "@patternfly/react-icons";
import { uniq } from "lodash-es";
import { toggleValueInList } from "@/Core";

interface Props {
  filterPropertyName: string;
  placeholder: string;
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
  filterPropertyName,
  placeholder,
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
        onToggle={(_event, val) => setIsFilterOpen(val)}
        onSelect={onSelect}
        selections={selectedStates}
        isOpen={isFilterOpen}
        placeholderText={placeholder}
        variant="typeaheadmulti"
        toggleIcon={<SearchIcon />}
        chipGroupProps={{ numChips: 0 }}
      >
        {possibleStates.map((state) => (
          <SelectOption key={state} value={state} />
        ))}
      </Select>
    </ToolbarFilter>
  );
};
