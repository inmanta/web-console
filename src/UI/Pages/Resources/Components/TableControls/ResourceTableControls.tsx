import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { Resource } from "@/Core";
import { AgentFilter, TypeFilter, ValueFilter } from "@/UI/Components";
import { DeployStateFilter } from "./DeployStateFilter";

interface Props {
  summaryWidget: React.ReactNode;
  paginationWidget: React.ReactNode;
  filter: Resource.Filter;
  setFilter: (filter: Resource.Filter) => void;
}

export const ResourceTableControls: React.FC<Props> = ({
  summaryWidget,
  paginationWidget,
  filter,
  setFilter,
}) => (
  <>
    <Toolbar clearAllFilters={() => setFilter({})}>
      <ToolbarContent>
        {summaryWidget}
        <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
      </ToolbarContent>
      <ToolbarContent>
        <ToolbarItem>
          <TypeFilter filter={filter} setFilter={setFilter} />
        </ToolbarItem>
        <ToolbarItem>
          <AgentFilter filter={filter} setFilter={setFilter} />
        </ToolbarItem>
        <ToolbarItem>
          <ValueFilter filter={filter} setFilter={setFilter} />
        </ToolbarItem>
        <ToolbarItem>
          <DeployStateFilter filter={filter} setFilter={setFilter} />
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  </>
);
