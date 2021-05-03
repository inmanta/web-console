import { Operator } from "@/Core";
import { Select, SelectOption, SelectVariant } from "@patternfly/react-core";
import React, { useState } from "react";

interface Props {
  onChange: (q: Operator) => void;
  isDisabled: boolean;
}

export const OperatorPicker: React.FC<Props> = ({ onChange, isDisabled }) => {
  const [isFilterOpen, setFilterOpen] = useState(false);

  const onSelect = (event, selection) => {
    onChange(selection);
    setFilterOpen(false);
  };

  return (
    <Select
      variant={SelectVariant.single}
      aria-label="Select Operator"
      onToggle={setFilterOpen}
      onSelect={onSelect}
      isOpen={isFilterOpen}
      placeholderText={"Select an operator..."}
      isDisabled={isDisabled}
    >
      {Object.keys(Operator).map((operator) => {
        return (
          <SelectOption key={operator} value={operator}>
            {Operator[operator]}
          </SelectOption>
        );
      })}
    </Select>
  );
};
