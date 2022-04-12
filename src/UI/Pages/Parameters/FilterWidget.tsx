import React, { useState } from "react";
import { ToolbarGroup } from "@patternfly/react-core";
import { DateRange, GetParameters } from "@/Core";
import { FilterPicker } from "@/UI/Components";
import { FreeTextFilter, TimestampFilter } from "@/UI/Components/Filters";
import { MomentDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";

interface Props {
  filter: GetParameters.Filter;
  setFilter: (filter: GetParameters.Filter) => void;
}

export const FilterWidget: React.FC<Props> = ({ filter, setFilter }) => {
  const [filterKind, setFilterKind] = useState<GetParameters.FilterKind>(
    GetParameters.FilterKind.Name
  );

  const updateSource = (sources: string[]) =>
    setFilter({ ...filter, source: sources.length > 0 ? sources : undefined });

  const updateName = (names: string[]) =>
    setFilter({ ...filter, name: names.length > 0 ? names : undefined });

  const updateUpdated = (timestampFilters: DateRange.Type[]) =>
    setFilter({
      ...filter,
      updated: timestampFilters.length > 0 ? timestampFilters : undefined,
    });
  return (
    <ToolbarGroup variant="filter-group" aria-label="FilterBar">
      <FilterPicker
        setFilterKind={setFilterKind}
        filterKind={filterKind}
        items={GetParameters.FilterList}
      />
      <FreeTextFilter
        isHidden={filterKind !== GetParameters.FilterKind.Name}
        searchEntries={filter.name}
        filterPropertyName={GetParameters.FilterKind.Name}
        placeholder={words("parameters.filters.name.placeholder")}
        update={updateName}
      />
      <FreeTextFilter
        isHidden={filterKind !== GetParameters.FilterKind.Source}
        searchEntries={filter.source}
        filterPropertyName={GetParameters.FilterKind.Source}
        placeholder={words("parameters.filters.source.placeholder")}
        update={updateSource}
      />
      <TimestampFilter
        datePresenter={new MomentDatePresenter()}
        isVisible={filterKind === GetParameters.FilterKind.Updated}
        timestampFilters={filter.updated ? filter.updated : []}
        update={updateUpdated}
      />
    </ToolbarGroup>
  );
};
