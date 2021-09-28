import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { CompileReportParams } from "@/Core";
import { CompileReportsFilterWidget } from "./FilterWidget";

interface Props {
  filter: CompileReportParams.Filter;
  setFilter: (filter: CompileReportParams.Filter) => void;
  paginationWidget: React.ReactNode;
}

export const CompileReportsTableControls: React.FC<Props> = ({
  filter,
  setFilter,
  paginationWidget,
}) => {
  return (
    <Toolbar
      clearAllFilters={() => setFilter({})}
      collapseListedFiltersBreakpoint="xl"
    >
      <ToolbarContent>
        <CompileReportsFilterWidget filter={filter} setFilter={setFilter} />
        <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};
