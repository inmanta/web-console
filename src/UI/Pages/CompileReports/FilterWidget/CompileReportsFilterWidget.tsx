import React, { useState } from "react";
import { ToolbarGroup } from "@patternfly/react-core";
import { CompileReportParams, DateRange } from "@/Core";
import { SelectOptionFilter, TimestampFilter } from "@/UI/Components/Filters";
import { MomentDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";
import { FilterPicker } from "./FilterPicker";
import { ResultFilter } from "./ResultFilter";

interface Props {
  filter: CompileReportParams.Filter;
  setFilter: (filter: CompileReportParams.Filter) => void;
}

export const CompileReportsFilterWidget: React.FC<Props> = ({
  filter,
  setFilter,
}) => {
  const [filterKind, setFilterKind] = useState<CompileReportParams.Kind>(
    CompileReportParams.Kind.Result
  );

  const updateResult = (success?: boolean) => setFilter({ ...filter, success });

  const compileStatuses = Object.keys(CompileReportParams.CompileStatus).map(
    (k) => CompileReportParams.CompileStatus[k]
  );

  const updateCompileStatus = (selectedCompileStatuses: string[]) =>
    setFilter({
      ...filter,
      status:
        selectedCompileStatuses.length > 0
          ? selectedCompileStatuses.map(
              (compileStatus) =>
                CompileReportParams.CompileStatus[
                  compileStatus.replace(/\s+/g, "")
                ]
            )
          : undefined,
    });

  const updateRequested = (timestampFilters: DateRange.Type[]) =>
    setFilter({
      ...filter,
      requested: timestampFilters.length > 0 ? timestampFilters : undefined,
    });
  return (
    <ToolbarGroup variant="filter-group" aria-label="FilterBar">
      <FilterPicker setFilterKind={setFilterKind} filterKind={filterKind} />
      <SelectOptionFilter
        filterPropertyName={CompileReportParams.Kind.Status}
        placeholder={words("compileReports.filters.status.placeholder")}
        isVisible={filterKind === CompileReportParams.Kind.Status}
        possibleStates={compileStatuses}
        selectedStates={filter.status ? filter.status : []}
        update={updateCompileStatus}
      />
      <ResultFilter
        isVisible={filterKind == CompileReportParams.Kind.Result}
        success={filter.success}
        update={updateResult}
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
