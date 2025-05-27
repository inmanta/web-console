import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { Filter } from "@/Slices/Agents/Core/Types";
import { AgentsFilterWidget } from "./FilterWidget/AgentsFilterWidget";

interface Props {
  filter: Filter;
  setFilter: (filter: Filter) => void;
  paginationWidget: React.ReactNode;
}

export const AgentsTableControls: React.FC<Props> = ({ filter, setFilter, paginationWidget }) => (
  <Toolbar clearAllFilters={() => setFilter({})} collapseListedFiltersBreakpoint="xl">
    <ToolbarContent>
      <AgentsFilterWidget filter={filter} setFilter={setFilter} />
      <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
    </ToolbarContent>
  </Toolbar>
);
