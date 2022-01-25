import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { DesiredStateParams } from "@/Core";
import { CompileWidget } from "@/UI/Components";
import { DesiredStatesFilterWidget } from "./FilterWidget";

interface Props {
  filter: DesiredStateParams.Filter;
  setFilter: (filter: DesiredStateParams.Filter) => void;
  paginationWidget: React.ReactNode;
}

export const DesiredStatesTableControls: React.FC<Props> = ({
  filter,
  setFilter,
  paginationWidget,
}) => (
  <Toolbar
    clearAllFilters={() => setFilter({})}
    collapseListedFiltersBreakpoint="xl"
  >
    <ToolbarContent>
      <DesiredStatesFilterWidget filter={filter} setFilter={setFilter} />
      <ToolbarItem variant="separator" />
      <CompileWidget />
      <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
    </ToolbarContent>
  </Toolbar>
);
