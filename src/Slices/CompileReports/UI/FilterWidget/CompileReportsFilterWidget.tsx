import React, { useState } from "react";
import { ToolbarGroup } from "@patternfly/react-core";
import { CompileStatus, DateRange } from "@/Core";
import { FilterPicker } from "@/UI/Components";
import { TimestampFilter } from "@/UI/Components/Filters";
import { MomentDatePresenter } from "@/UI/Utils";
import { Filter, Kind, List } from "@S/CompileReports/Core/Query";
import { StatusFilter } from "./StatusFilter";

interface Props {
  filter: Filter;
  setFilter: (filter: Filter) => void;
}

export const CompileReportsFilterWidget: React.FC<Props> = ({
  filter,
  setFilter,
}) => {
  const [filterKind, setFilterKind] = useState<Kind>(Kind.Status);

  const updateCompileStatus = (selectedCompileStatus: string | null) =>
    setFilter({
      ...filter,
      status: selectedCompileStatus
        ? CompileStatus[selectedCompileStatus.replace(/\s+/g, "")]
        : undefined,
    });

  const updateRequested = (timestampFilters: DateRange.Type[]) =>
    setFilter({
      ...filter,
      requested: timestampFilters.length > 0 ? timestampFilters : undefined,
    });

  return (
    <ToolbarGroup variant="filter-group" aria-label="FilterBar">
      <FilterPicker
        setFilterKind={setFilterKind}
        filterKind={filterKind}
        items={List}
      />
      <StatusFilter
        isVisible={filterKind === Kind.Status}
        selected={filter.status ? filter.status : null}
        setSelected={updateCompileStatus}
      />
      <TimestampFilter
        datePresenter={new MomentDatePresenter()}
        isVisible={filterKind === Kind.Requested}
        timestampFilters={filter.requested ? filter.requested : []}
        update={updateRequested}
      />
    </ToolbarGroup>
  );
};
