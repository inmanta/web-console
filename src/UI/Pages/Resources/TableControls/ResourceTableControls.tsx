import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { ResourceParams } from "@/Core";
import { DeployStateFilter } from "./DeployStateFilter";
import { TypeFilter } from "./TypeFilter";
import { AgentFilter } from "./AgentFilter";
import { ValueFilter } from "./ValueFilter";

interface Props {
  paginationWidget: React.ReactNode;
  filter: ResourceParams.Filter;
  setFilter: (filter: ResourceParams.Filter) => void;
}

export const ResourceTableControls: React.FC<Props> = ({
  paginationWidget,
  filter,
  setFilter,
}) => (
  <>
    <Toolbar clearAllFilters={() => setFilter({})}>
      <ToolbarContent>
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
