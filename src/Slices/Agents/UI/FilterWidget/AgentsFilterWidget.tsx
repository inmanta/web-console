import React, { useState } from "react";
import { ToolbarGroup } from "@patternfly/react-core";
import { FilterPicker } from "@/UI/Components";
import { FreeTextFilter, SelectOptionFilter } from "@/UI/Components/Filters";
import { words } from "@/UI/words";
import { AgentStatus } from "@S/Agents/Core/Domain";
import { Filter } from "@S/Agents/Core/Query";

enum Kind {
  Name = "Name",
  ProcessName = "Process Name",
  Status = "Status",
}

interface Props {
  filter: Filter;
  setFilter: (filter: Filter) => void;
}

export const AgentsFilterWidget: React.FC<Props> = ({ filter, setFilter }) => {
  const [filterKind, setFilterKind] = useState<Kind>(Kind.Name);

  const updateName = (names: string[]) =>
    setFilter({ ...filter, name: names.length > 0 ? names : undefined });

  const updateProcessName = (processNames: string[]) => {
    setFilter({
      ...filter,
      process_name: processNames.length > 0 ? processNames : undefined,
    });
  };

  const agentStatuses = Object.keys(AgentStatus).map((k) => AgentStatus[k]);

  const updateStatus = (selectedStatuses: string[]) =>
    setFilter({
      ...filter,
      status:
        selectedStatuses.length > 0
          ? selectedStatuses.map((status) => AgentStatus[status])
          : undefined,
    });

  return (
    <ToolbarGroup variant="filter-group" aria-label="FilterBar">
      <FilterPicker
        setFilterKind={setFilterKind}
        filterKind={filterKind}
        items={[Kind.Name, Kind.ProcessName, Kind.Status]}
      />
      <SelectOptionFilter
        filterPropertyName={Kind.Status}
        placeholder={words("agents.filters.status.placeholder")}
        isVisible={filterKind === Kind.Status}
        possibleStates={agentStatuses}
        selectedStates={filter.status ? filter.status : []}
        update={updateStatus}
      />
      <FreeTextFilter
        isHidden={filterKind !== Kind.Name}
        filterPropertyName={Kind.Name}
        searchEntries={filter.name}
        update={updateName}
        placeholder={words("agents.filters.name.placeholder")}
      />
      <FreeTextFilter
        isHidden={filterKind !== Kind.ProcessName}
        filterPropertyName={Kind.ProcessName}
        searchEntries={filter.process_name}
        update={updateProcessName}
        placeholder={words("agents.filters.processName.placeholder")}
      />
    </ToolbarGroup>
  );
};
