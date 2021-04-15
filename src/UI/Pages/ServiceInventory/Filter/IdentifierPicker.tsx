import React, { useState } from "react";
import { ServiceInstanceParams } from "@/Core";
import { Select, SelectOption, SelectVariant } from "@patternfly/react-core";

interface Props {
  identifier: ServiceInstanceParams.Attributes | undefined;
  onChange: (id: ServiceInstanceParams.Attributes) => void;
}

export const IdentifierPicker: React.FC<Props> = ({ identifier, onChange }) => {
  const [isFilterOpen, setFilterOpen] = useState(false);

  const onSelect = (event, selection) => {
    setFilterOpen(false);
    onChange(selection);
  };

  return (
    <Select
      variant={SelectVariant.single}
      aria-label="Select Identifier"
      onToggle={setFilterOpen}
      onSelect={onSelect}
      selections={identifier}
      isOpen={isFilterOpen}
      placeholderText="Select an identifier..."
    >
      <SelectOption key={1} value={ServiceInstanceParams.Attributes.Candidate}>
        Candidate
      </SelectOption>
      <SelectOption key={2} value={ServiceInstanceParams.Attributes.Active}>
        Active
      </SelectOption>
      <SelectOption key={3} value={ServiceInstanceParams.Attributes.Rollback}>
        Rollback
      </SelectOption>
    </Select>
  );
};
