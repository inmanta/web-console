import React, { useState } from "react";
import { ToolbarGroup } from "@patternfly/react-core";
import { AgentParams, AgentStatus } from "@/Core";
import { FilterPicker } from "@/UI/Components";
import { FreeTextFilter, SelectOptionFilter } from "@/UI/Components/Filters";
import { words } from "@/UI/words";

interface Props {
  filter: AgentParams.Filter;
  setFilter: (filter: AgentParams.Filter) => void;
}

export const AgentsFilterWidget: React.FC<Props> = ({ filter, setFilter }) => {
  const [filterKind, setFilterKind] = useState<AgentParams.Kind>(
    AgentParams.Kind.Name
  );

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
        items={AgentParams.List}
      />
      <SelectOptionFilter
        filterPropertyName={AgentParams.Kind.Status}
        placeholder={words("agents.filters.status.placeholder")}
        isVisible={filterKind === AgentParams.Kind.Status}
        possibleStates={agentStatuses}
        selectedStates={filter.status ? filter.status : []}
        update={updateStatus}
      />
      <FreeTextFilter
        isHidden={filterKind !== AgentParams.Kind.Name}
        filterPropertyName={AgentParams.Kind.Name}
        searchEntries={filter.name}
        update={updateName}
        placeholder={words("agents.filters.name.placeholder")}
      />
      <FreeTextFilter
        isHidden={filterKind !== AgentParams.Kind.ProcessName}
        filterPropertyName={AgentParams.Kind.ProcessName}
        searchEntries={filter.process_name}
        update={updateProcessName}
        placeholder={words("agents.filters.processName.placeholder")}
      />
    </ToolbarGroup>
  );
};
