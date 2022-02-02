import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { GetParameters } from "@/Core";
import { FilterWidget } from "./FilterWidget";

interface Props {
  filter: GetParameters.Filter;
  setFilter: (filter: GetParameters.Filter) => void;
  paginationWidget: React.ReactNode;
}

export const TableControls: React.FC<Props> = ({
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
        <FilterWidget filter={filter} setFilter={setFilter} />
        <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};
