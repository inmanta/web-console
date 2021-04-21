import React, { useState } from "react";
import { ServiceInstanceParams } from "@/Core";
import { Select, SelectOption, SelectVariant } from "@patternfly/react-core";

interface Props {
  attributeSet: ServiceInstanceParams.AttributeSet | undefined;
  onChange: (id: ServiceInstanceParams.AttributeSet) => void;
}

export const AttributeSetPicker: React.FC<Props> = ({
  attributeSet,
  onChange,
}) => {
  const [isFilterOpen, setFilterOpen] = useState(false);

  const onSelect = (event, selection) => {
    setFilterOpen(false);
    onChange(selection);
  };

  return (
    <Select
      variant={SelectVariant.single}
      aria-label="Select AttributeSet"
      onToggle={setFilterOpen}
      onSelect={onSelect}
      selections={attributeSet}
      isOpen={isFilterOpen}
      placeholderText="Select an AttributeSet..."
    >
      <SelectOption
        key={1}
        value={ServiceInstanceParams.AttributeSet.Candidate}
      >
        Candidate
      </SelectOption>
      <SelectOption key={2} value={ServiceInstanceParams.AttributeSet.Active}>
        Active
      </SelectOption>
      <SelectOption key={3} value={ServiceInstanceParams.AttributeSet.Rollback}>
        Rollback
      </SelectOption>
    </Select>
  );
};
