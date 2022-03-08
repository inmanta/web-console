import React from "react";
import {
  Toolbar,
  ToolbarItem,
  ToolbarContent,
  Button,
} from "@patternfly/react-core";
import { Resource } from "@/Core";
import { AgentFilter, TypeFilter, ValueFilter } from "@/UI/Components";
import { words } from "@/UI/words";
import { DeployStateFilter } from "./DeployStateFilter";

interface Props {
  summaryWidget: React.ReactNode;
  paginationWidget: React.ReactNode;
  filter: Resource.FilterWithDefaultHandling;
  setFilter: (filter: Resource.FilterWithDefaultHandling) => void;
}

export const ResourceTableControls: React.FC<Props> = ({
  summaryWidget,
  paginationWidget,
  filter,
  setFilter,
}) => (
  <>
    <Toolbar
      clearAllFilters={() => {
        setFilter({ disregardDefault: true });
      }}
      aria-label="Resources-toolbar"
    >
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
        <ToolbarItem>
          <Button
            variant="link"
            isInline
            onClick={() => setFilter({})}
            aria-label="Reset-filters"
          >
            {words("resources.filters.reset")}
          </Button>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  </>
);
