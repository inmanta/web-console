import React, { useState } from "react";
import { ToolbarGroup } from "@patternfly/react-core";
import { CompileReportParams, CompileStatus, DateRange } from "@/Core";
import { FilterPicker } from "@/UI/Components";
import { TimestampFilter } from "@/UI/Components/Filters";
import { MomentDatePresenter } from "@/UI/Utils";
import { StatusFilter } from "./StatusFilter";

interface Props {
  filter: CompileReportParams.Filter;
  setFilter: (filter: CompileReportParams.Filter) => void;
}

export const CompileReportsFilterWidget: React.FC<Props> = ({
  filter,
  setFilter,
}) => {
  const [filterKind, setFilterKind] = useState<CompileReportParams.Kind>(
    CompileReportParams.Kind.Status
  );

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
        items={CompileReportParams.List}
      />
      <StatusFilter
        isVisible={filterKind === CompileReportParams.Kind.Status}
        selected={filter.status ? filter.status : null}
        setSelected={updateCompileStatus}
      />
      <TimestampFilter
        datePresenter={new MomentDatePresenter()}
        isVisible={filterKind === CompileReportParams.Kind.Requested}
        timestampFilters={filter.requested ? filter.requested : []}
        update={updateRequested}
      />
    </ToolbarGroup>
  );
};
