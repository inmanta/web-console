import { LatestReleasedResourceParams, ResourceStatus } from "@/Core";
import { FreeTextFilter, SelectOptionFilter } from "@/UI/Components/Filters";
import { words } from "@/UI/words";
import { ToolbarGroup } from "@patternfly/react-core";
import React, { useState } from "react";
import { FilterPicker } from "./FilterPicker";

interface Props {
  filter: LatestReleasedResourceParams.Filter;
  setFilter: (filter: LatestReleasedResourceParams.Filter) => void;
}
export const FilterWidget: React.FC<Props> = ({ filter, setFilter }) => {
  const [filterKind, setFilterKind] =
    useState<LatestReleasedResourceParams.Kind>(
      LatestReleasedResourceParams.Kind.Status
    );

  const updateStatus = (statuses: string[]) =>
    setFilter({
      ...filter,
      status:
        statuses.length > 0
          ? statuses.map((status) => ResourceStatus[status])
          : undefined,
    });

  const updateType = (types: string[]) =>
    setFilter({ ...filter, type: types.length > 0 ? types : undefined });

  const updateAgent = (agents: string[]) =>
    setFilter({ ...filter, agent: agents.length > 0 ? agents : undefined });

  const updateValue = (values: string[]) =>
    setFilter({ ...filter, value: values.length > 0 ? values : undefined });

  return (
    <ToolbarGroup variant="filter-group" aria-label="FilterBar">
      <FilterPicker setFilterKind={setFilterKind} filterKind={filterKind} />
      <SelectOptionFilter
        isVisible={filterKind === LatestReleasedResourceParams.Kind.Status}
        filterPropertyName={words("resources.column.deployState")}
        placeholder={words("resources.filters.status.placeholder")}
        possibleStates={Object.keys(ResourceStatus).map(
          (k) => ResourceStatus[k]
        )}
        selectedStates={filter.status ? filter.status : []}
        update={updateStatus}
      />
      <FreeTextFilter
        isVisible={filterKind === LatestReleasedResourceParams.Kind.Agent}
        searchEntries={filter.agent}
        filterPropertyName={LatestReleasedResourceParams.Kind.Agent}
        placeholder={words("resources.filters.agent.placeholder")}
        update={updateAgent}
      />
      <FreeTextFilter
        isVisible={filterKind === LatestReleasedResourceParams.Kind.Type}
        searchEntries={filter.type}
        filterPropertyName={LatestReleasedResourceParams.Kind.Type}
        placeholder={words("resources.filters.type.placeholder")}
        update={updateType}
      />
      <FreeTextFilter
        isVisible={filterKind === LatestReleasedResourceParams.Kind.Value}
        searchEntries={filter.value}
        filterPropertyName={LatestReleasedResourceParams.Kind.Value}
        placeholder={words("resources.filters.value.placeholder")}
        update={updateValue}
      />
    </ToolbarGroup>
  );
};
