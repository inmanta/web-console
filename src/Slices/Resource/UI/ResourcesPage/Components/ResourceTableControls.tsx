import React from "react";
import {
  Toolbar,
  ToolbarItem,
  ToolbarContent,
  Button,
} from "@patternfly/react-core";
import { Resource } from "@/Core";
import { FilterForm } from "@/UI/Components";
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
        <FilterForm filter={filter} setFilter={setFilter} />
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
