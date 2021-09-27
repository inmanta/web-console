import React, { useState } from "react";
import { LogLevelsList, ResourceLogFilter } from "@/Core";
import {
  Select,
  SelectOption,
  SelectVariant,
  ToolbarFilter,
} from "@patternfly/react-core";

interface Props {
  filter: ResourceLogFilter;
  setFilter: (filter: ResourceLogFilter) => void;
}

export const LogLevelFilter: React.FC<Props> = ({ filter, setFilter }) => {
  const update = (level: string) =>
    setFilter({
      ...filter,
      minimal_log_level: filter.minimal_log_level === level ? undefined : level,
    });

  const [isFilterOpen, setFilterOpen] = useState(false);

  const onSelect = (event, selection) => {
    update(selection);
    setFilterOpen(false);
  };

  const deleteChip = () =>
    setFilter({
      ...filter,
      minimal_log_level: undefined,
    });

  return (
    <ToolbarFilter
      chips={filter.minimal_log_level ? [filter.minimal_log_level] : []}
      deleteChip={deleteChip}
      categoryName="Minimal Log Level"
    >
      <Select
        variant={SelectVariant.single}
        aria-label="Select Deleted"
        onToggle={setFilterOpen}
        onSelect={onSelect}
        selections={filter.minimal_log_level ? [filter.minimal_log_level] : []}
        isOpen={isFilterOpen}
        placeholderText="Minimal Log Level..."
      >
        {LogLevelsList.map((value) => (
          <SelectOption key={value} value={value}>
            {value}
          </SelectOption>
        ))}
      </Select>
    </ToolbarFilter>
  );
};
