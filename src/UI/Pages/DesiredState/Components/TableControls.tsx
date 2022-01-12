import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { DesiredStateParams } from "@/Core";
import { CompileWidget } from "@/UI/Components";
import { CompareSelectionWidget } from "./CompareSelectionWidget";
import { FilterWidget } from "./FilterWidget";

interface Props {
  filter: DesiredStateParams.Filter;
  setFilter: (filter: DesiredStateParams.Filter) => void;
  paginationWidget: React.ReactNode;
}

export const TableControls: React.FC<Props> = ({
  filter,
  setFilter,
  paginationWidget,
}) => (
  <Toolbar
    clearAllFilters={() => setFilter({})}
    collapseListedFiltersBreakpoint="xl"
  >
    <ToolbarContent>
      <FilterWidget filter={filter} setFilter={setFilter} />
      <ToolbarItem variant="separator" />
      <CompileWidget />
      <CompareSelectionWidget />
      <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
    </ToolbarContent>
  </Toolbar>
);
