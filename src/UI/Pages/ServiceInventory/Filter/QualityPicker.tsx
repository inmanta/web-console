import { Select, SelectOption, SelectVariant } from "@patternfly/react-core";
import React, { useState } from "react";

export enum Quality {
  Empty = "empty",
  NotEmpty = "not empty",
}

interface Props {
  quality: Quality | undefined;
  onChange: (q: Quality) => void;
  isDisabled: boolean;
}

export const QualityPicker: React.FC<Props> = ({
  quality,
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
      aria-label="Select Quality"
      onToggle={setFilterOpen}
      onSelect={onSelect}
      selections={quality}
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
