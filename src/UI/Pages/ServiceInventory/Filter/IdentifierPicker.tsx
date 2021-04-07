import React, { useState } from "react";
import { Query } from "@/Core";
import { Select, SelectOption, SelectVariant } from "@patternfly/react-core";

interface Props {
  identifier: Query.Attributes | undefined;
  onChange: (id: Query.Attributes) => void;
}

export const IdentifierPicker: React.FC<Props> = ({ identifier, onChange }) => {
  const [isFilterOpen, setFilterOpen] = useState(false);

  const onSelect = (event, selection) => {
    onChange(selection);
    setFilterOpen(false);
  };

  return (
    <Select
      variant={SelectVariant.single}
      aria-label="Select Identifier"
      onToggle={setFilterOpen}
      onSelect={onSelect}
      selections={identifier}
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
