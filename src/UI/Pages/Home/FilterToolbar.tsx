import React from "react";
import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from "@patternfly/react-core";
import { words } from "@/UI";
import { SimpleFreeTextFilter, SelectOptionFilter } from "@/UI/Components";

interface Props {
  projectFilter?: string[];
  setProjectFilter: (projectFilter?: string[]) => void;
  projectNames: string[];
  environmentFilter?: string;
  setEnvironmentFilter: (environmentFilter?: string) => void;
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
            <SimpleFreeTextFilter
              isVisible={true}
              filterPropertyName={"environment"}
              placeholder={words("home.filters.env.placeholder")}
              update={setEnvironmentFilter}
              searchEntry={environmentFilter}
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

export const EmptyFilterToolbar: React.FC = () => (
  <Toolbar>
    <ToolbarContent>
      <ToolbarGroup variant="filter-group" aria-label="FilterBar">
        <ToolbarItem style={{ height: "36px" }} />
      </ToolbarGroup>
    </ToolbarContent>
  </Toolbar>
);
