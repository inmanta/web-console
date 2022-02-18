import React, { useState } from "react";
import { ToolbarGroup } from "@patternfly/react-core";
import { DateRange, DesiredStateParams, IntRange } from "@/Core";
import { DesiredStateVersionStatus } from "@/Core/Domain/DesiredStateVersionStatus";
import { MomentDatePresenter } from "@/UI";
import { FilterPicker } from "@/UI/Components";
import {
  IntRangeFilter,
  SelectOptionFilter,
  TimestampFilter,
} from "@/UI/Components/Filters";
import { words } from "@/UI/words";

interface Props {
  filter: DesiredStateParams.Filter;
  setFilter: (filter: DesiredStateParams.Filter) => void;
}

export const FilterWidget: React.FC<Props> = ({ filter, setFilter }) => {
  const [filterKind, setFilterKind] = useState<DesiredStateParams.Kind>(
    DesiredStateParams.Kind.Status
  );

  const desiredStateStatuses = Object.keys(DesiredStateVersionStatus).map(
    (k) => DesiredStateVersionStatus[k]
  );

  const updateStatus = (selectedStatuses: string[]) =>
    setFilter({
      ...filter,
      status:
        selectedStatuses.length > 0
          ? selectedStatuses.map((status) => DesiredStateVersionStatus[status])
          : undefined,
    });

  const updateDate = (timestampFilters: DateRange.Type[]) =>
    setFilter({
      ...filter,
      date: timestampFilters.length > 0 ? timestampFilters : undefined,
    });

  const updateVersion = (intRangeFilters: IntRange.Type[]) =>
    setFilter({
      ...filter,
      version: intRangeFilters.length > 0 ? intRangeFilters : undefined,
    });

  return (
    <ToolbarGroup variant="filter-group" aria-label="FilterBar">
      <FilterPicker
        setFilterKind={setFilterKind}
        filterKind={filterKind}
        items={DesiredStateParams.List}
      />
      <SelectOptionFilter
        filterPropertyName={DesiredStateParams.Kind.Status}
        placeholder={words("desiredState.filters.status.placeholder")}
        isVisible={filterKind === DesiredStateParams.Kind.Status}
        possibleStates={desiredStateStatuses}
        selectedStates={filter.status ? filter.status : []}
        update={updateStatus}
      />
      <TimestampFilter
        datePresenter={new MomentDatePresenter()}
        isVisible={filterKind === DesiredStateParams.Kind.Date}
        timestampFilters={filter.date ? filter.date : []}
        update={updateDate}
      />
      <IntRangeFilter
        isVisible={filterKind == DesiredStateParams.Kind.Version}
        intRangeFilters={filter.version ? filter.version : []}
        update={updateVersion}
        categoryName={DesiredStateParams.Kind.Version}
      />
    </ToolbarGroup>
  );
};
