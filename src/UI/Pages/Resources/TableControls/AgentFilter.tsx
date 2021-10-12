import React from "react";
import { ResourceParams } from "@/Core";
import { FreeTextFilter } from "@/UI/Components/Filters";
import { words } from "@/UI/words";

interface Props {
  filter: ResourceParams.Filter;
  setFilter: (filter: ResourceParams.Filter) => void;
}
export const AgentFilter: React.FC<Props> = ({ filter, setFilter }) => {
  const updateAgent = (agents: string[]) =>
    setFilter({ ...filter, agent: agents.length > 0 ? agents : undefined });

  return (
    <FreeTextFilter
      isVisible={true}
      searchEntries={filter.agent}
      filterPropertyName={ResourceParams.Kind.Agent}
      placeholder={words("resources.filters.agent.placeholder")}
      update={updateAgent}
    />
  );
};
