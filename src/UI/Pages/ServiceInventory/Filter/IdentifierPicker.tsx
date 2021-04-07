import React, { useState } from "react";
import { Query } from "@/Core";
import { Select, SelectOption, SelectVariant } from "@patternfly/react-core";

interface IdentifierSelectorProps {
  identifierFilter: Query.Attributes | undefined;
  setIdentifierFilter: (id: Query.Attributes) => void;
}

export const IdentifierPicker: React.FC<IdentifierSelectorProps> = ({
  identifierFilter,
  setIdentifierFilter,
}) => {
  const [isFilterOpen, setFilterOpen] = useState(false);

  const onSelect = (event, selection) => {
    setIdentifierFilter(selection);
    setFilterOpen(false);
  };

  return (
    <Select
      variant={SelectVariant.single}
      aria-label="Select Identifier"
      onToggle={setFilterOpen}
      onSelect={onSelect}
      selections={identifierFilter}
      isOpen={isFilterOpen}
      placeholderText="Select Identifier"
    >
      <SelectOption key={1} value={Query.Attributes.Candidate}>
        Candidate
      </SelectOption>
      <SelectOption key={2} value={Query.Attributes.Active}>
        Active
      </SelectOption>
      <SelectOption key={3} value={Query.Attributes.Rollback}>
        Rollback
      </SelectOption>
    </Select>
  );
};
