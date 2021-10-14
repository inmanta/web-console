import React from "react";
import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from "@patternfly/react-core";
import { words } from "@/UI";
import { FreeTextFilter, SelectOptionFilter } from "@/UI/Components";

interface Props {
  projectFilter?: string[];
  setProjectFilter: (projectFilter?: string[]) => void;
  projectNames: string[];
  environmentFilter?: string[];
  setEnvironmentFilter: (environmentFilter?: string[]) => void;
  clearFilters: () => void;
}

export const FilterToolbar: React.FC<Props> = ({
  projectNames,
  projectFilter,
  environmentFilter,
  setEnvironmentFilter,
  setProjectFilter,
  clearFilters,
}) => {
  return (
    <Toolbar clearAllFilters={clearFilters}>
      <ToolbarContent>
        <ToolbarGroup variant="filter-group" aria-label="FilterBar">
          <ToolbarItem variant="search-filter">
            <FreeTextFilter
              isVisible={true}
              filterPropertyName={"environment"}
              placeholder={words("home.filters.env.placeholder")}
              update={setEnvironmentFilter}
              searchEntries={environmentFilter}
            />
          </ToolbarItem>
          <ToolbarItem variant="search-filter">
            <SelectOptionFilter
              isVisible={true}
              possibleStates={projectNames}
              selectedStates={projectFilter ? projectFilter : []}
              filterPropertyName={"project"}
              update={setProjectFilter}
              placeholder={words("home.filters.project.placeholder")}
            />
          </ToolbarItem>
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );
};
