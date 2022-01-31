import React from "react";
import { Resource } from "@/Core";
import { FreeTextFilter } from "@/UI/Components/Filters";
import { words } from "@/UI/words";

interface Props {
  filter: Resource.Filter;
  setFilter: (filter: Resource.Filter) => void;
}

export const AgentFilter: React.FC<Props> = ({ filter, setFilter }) => {
  const updateAgent = (agents: string[]) =>
    setFilter({ ...filter, agent: agents.length > 0 ? agents : undefined });

  return (
    <FreeTextFilter
      searchEntries={filter.agent}
      filterPropertyName={Resource.FilterKind.Agent}
      placeholder={words("resources.filters.agent.placeholder")}
      update={updateAgent}
    />
  );
};
