import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { AgentParams } from "@/Core";
import { AgentsFilterWidget } from "./FilterWidget/AgentsFilterWidget";

interface Props {
  filter: AgentParams.Filter;
  setFilter: (filter: AgentParams.Filter) => void;
  paginationWidget: React.ReactNode;
}

export const AgentsTableControls: React.FC<Props> = ({
  filter,
  setFilter,
  paginationWidget,
}) => (
  <Toolbar
    clearAllFilters={() => setFilter({})}
    collapseListedFiltersBreakpoint="xl"
  >
    <ToolbarContent>
      <AgentsFilterWidget filter={filter} setFilter={setFilter} />
      <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
    </ToolbarContent>
  </Toolbar>
);
