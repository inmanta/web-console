import React, { useState } from "react";
import { ToolbarGroup } from "@patternfly/react-core";
import { DateRange } from "@/Core";
import { FilterPicker } from "@/UI/Components";
import { FreeTextFilter, TimestampFilter } from "@/UI/Components/Filters";
import { MomentDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";
import { FilterKind, Filter, FilterList } from "@S/Parameters/Core/Query";

interface Props {
  filter: Filter;
  setFilter: (filter: Filter) => void;
}

export const FilterWidget: React.FC<Props> = ({ filter, setFilter }) => {
  const [filterKind, setFilterKind] = useState<FilterKind>(FilterKind.Name);

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
        items={FilterList}
      />
      <FreeTextFilter
        isHidden={filterKind !== FilterKind.Name}
        searchEntries={filter.name}
        filterPropertyName={FilterKind.Name}
        placeholder={words("parameters.filters.name.placeholder")}
        update={updateName}
      />
      <FreeTextFilter
        isHidden={filterKind !== FilterKind.Source}
        searchEntries={filter.source}
        filterPropertyName={FilterKind.Source}
        placeholder={words("parameters.filters.source.placeholder")}
        update={updateSource}
      />
      <TimestampFilter
        datePresenter={new MomentDatePresenter()}
        isVisible={filterKind === FilterKind.Updated}
        timestampFilters={filter.updated ? filter.updated : []}
        update={updateUpdated}
      />
    </ToolbarGroup>
  );
};
