import React from "react";
import { ToolbarFilter } from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";
import { uniq } from "lodash-es";
import { toggleValueInList } from "@/Core";
import { MultiTextSelect } from "../MultiTextSelect";

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
  const onSelect = (selection) => {
    update(uniq(toggleValueInList(selection, selectedStates)));
  };

  const removeChip = (_cat, id) => {
    update(selectedStates.filter((value) => value !== id));
  };

  return (
    <ToolbarFilter
      chips={selectedStates}
      deleteChip={removeChip}
      categoryName={filterPropertyName}
      showToolbarItem={isVisible}
    >
      <MultiTextSelect
        toggleAriaLabel={filterPropertyName}
        options={possibleStates.map((option) => {
          return { value: option, children: option };
        })}
        setSelected={onSelect}
        placeholderText={placeholder}
        selected={selectedStates}
        hasChips
        toggleIcon={<SearchIcon aria-hidden />}
      />
    </ToolbarFilter>
  );
};
