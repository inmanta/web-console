import { words } from "@/UI";
import { FreeTextFilter, SelectOptionFilter } from "@/UI/Components";
import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from "@patternfly/react-core";
import React from "react";

interface Props {
  projectFilter: string[];
  setProjectFilter: (projectFilter: string[]) => void;
  projectNames: string[];
  environmentFilter: string[];
  setEnvironmentFilter: (environmentFilter: string[]) => void;
}

export const FilterToolbar: React.FC<Props> = ({
  projectNames,
  projectFilter,
  setProjectFilter,
  environmentFilter,
  setEnvironmentFilter,
}) => {
  return (
    <Toolbar
      clearAllFilters={() => {
        setProjectFilter([]);
        setEnvironmentFilter([]);
      }}
    >
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
              selectedStates={projectFilter}
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
