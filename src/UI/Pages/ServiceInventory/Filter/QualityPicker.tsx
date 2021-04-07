import { Select, SelectOption, SelectVariant } from "@patternfly/react-core";
import React, { useState } from "react";

export type Quality = "empty" | "not empty";

interface Props {
  qualityFilter: Quality | undefined;
  setQualityFilter: (q: Quality) => void;
  isDisabled: boolean;
}

export const QualityPicker: React.FC<Props> = ({
  qualityFilter,
  setQualityFilter,
  isDisabled,
}) => {
  const [isFilterOpen, setFilterOpen] = useState(false);

  const onSelect = (event, selection) => {
    setQualityFilter(selection);
    setFilterOpen(false);
  };

  return (
    <Select
      variant={SelectVariant.single}
      aria-label="Select Quality"
      onToggle={setFilterOpen}
      onSelect={onSelect}
      selections={qualityFilter}
      isOpen={isFilterOpen}
      placeholderText={"Select Quality"}
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
