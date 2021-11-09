import React, { useState } from "react";
import { Select, SelectOption, SelectVariant } from "@patternfly/react-core";

export enum AttributeRule {
  Empty = "empty",
  NotEmpty = "not empty",
}

interface Props {
  rule: AttributeRule | undefined;
  onChange: (q: AttributeRule) => void;
  isDisabled: boolean;
}

export const AttributeRulePicker: React.FC<Props> = ({
  rule,
  onChange,
  isDisabled,
}) => {
  const [isFilterOpen, setFilterOpen] = useState(false);

  const onSelect = (event, selection) => {
    onChange(selection);
    setFilterOpen(false);
  };

  return (
    <Select
      variant={SelectVariant.single}
      toggleAriaLabel="Select Quality"
      onToggle={setFilterOpen}
      onSelect={onSelect}
      selections={rule}
      isOpen={isFilterOpen}
      placeholderText={"Select a quality..."}
      isDisabled={isDisabled}
    >
      <SelectOption key={0} value="empty">
        Empty
      </SelectOption>
      <SelectOption key={1} value="not empty">
        Not Empty
      </SelectOption>
    </Select>
  );
};
