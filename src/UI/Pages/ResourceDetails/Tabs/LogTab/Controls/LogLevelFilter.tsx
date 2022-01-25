import React from "react";
import { ToolbarFilter } from "@patternfly/react-core";
import { LogLevelsList, ResourceLogFilter } from "@/Core";
import { SingleTextSelect } from "@/UI/Components";
import { words } from "@/UI/words";

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

  const onSelect = (selection) => {
    update(selection === null ? undefined : selection);
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
      <SingleTextSelect
        options={LogLevelsList}
        selected={filter.minimal_log_level || null}
        setSelected={onSelect}
        toggleAriaLabel="MinimalLogLevel"
        placeholderText={words("resources.logs.logLevel.placeholder")}
      />
    </ToolbarFilter>
  );
};
