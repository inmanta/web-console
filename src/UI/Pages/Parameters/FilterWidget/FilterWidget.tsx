import React, { useState } from "react";
import { ToolbarGroup } from "@patternfly/react-core";
import { DateRange, ParametersQueryParams } from "@/Core";
import { FreeTextFilter, TimestampFilter } from "@/UI/Components/Filters";
import { MomentDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";
import { FilterPicker } from "./FilterPicker";

interface Props {
  filter: ParametersQueryParams.Filter;
  setFilter: (filter: ParametersQueryParams.Filter) => void;
}

export const FilterWidget: React.FC<Props> = ({ filter, setFilter }) => {
  const [filterKind, setFilterKind] = useState<ParametersQueryParams.Kind>(
    ParametersQueryParams.Kind.Name
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
      <FilterPicker setFilterKind={setFilterKind} filterKind={filterKind} />
      <FreeTextFilter
        isVisible={filterKind === ParametersQueryParams.Kind.Name}
        searchEntries={filter.name}
        filterPropertyName={ParametersQueryParams.Kind.Name}
        placeholder={words("parameters.filters.name.placeholder")}
        update={updateName}
      />
      <FreeTextFilter
        isVisible={filterKind === ParametersQueryParams.Kind.Source}
        searchEntries={filter.source}
        filterPropertyName={ParametersQueryParams.Kind.Source}
        placeholder={words("parameters.filters.source.placeholder")}
        update={updateSource}
      />
      <TimestampFilter
        datePresenter={new MomentDatePresenter()}
        isVisible={filterKind === ParametersQueryParams.Kind.Updated}
        timestampFilters={filter.updated ? filter.updated : []}
        update={updateUpdated}
      />
    </ToolbarGroup>
  );
};
