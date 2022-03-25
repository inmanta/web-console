import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { CompileWidget } from "@/UI/Components";
import { Filter } from "@S/CompileReports/Core/Query";
import { CompileReportsFilterWidget } from "./FilterWidget";

interface Props {
  filter: Filter;
  setFilter: (filter: Filter) => void;
  paginationWidget: React.ReactNode;
  afterRecompile(): void;
}

export const CompileReportsTableControls: React.FC<Props> = ({
  filter,
  setFilter,
  paginationWidget,
  afterRecompile,
}) => {
  return (
    <Toolbar
      clearAllFilters={() => setFilter({})}
      collapseListedFiltersBreakpoint="xl"
    >
      <ToolbarContent>
        <CompileReportsFilterWidget filter={filter} setFilter={setFilter} />
        <ToolbarItem variant="separator" />
        <CompileWidget afterTrigger={afterRecompile} />
        <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};
