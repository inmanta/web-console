import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { GetFacts } from "@/Core";

interface Props {
  filter: GetFacts.Filter;
  setFilter: (filter: GetFacts.Filter) => void;
  paginationWidget: React.ReactNode;
}

export const TableControls: React.FC<Props> = ({
  setFilter,
  paginationWidget,
}) => (
  <Toolbar
    clearAllFilters={() => setFilter({})}
    collapseListedFiltersBreakpoint="xl"
  >
    <ToolbarContent>
      <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
    </ToolbarContent>
  </Toolbar>
);
