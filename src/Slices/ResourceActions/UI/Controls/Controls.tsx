import React from "react";
import { Toolbar, ToolbarContent, ToolbarItem } from "@patternfly/react-core";
import { words } from "@/UI/words";
import { ResourceActionFilter } from "@S/ResourceActions/Core/Domain";
import { LogLevelFilter } from "./LogLevelFilter";
import { SingleTextFilter } from "./SingleTextFilter";

interface Props {
  filter: ResourceActionFilter;
  setFilter: (filter: ResourceActionFilter) => void;
  paginationWidget: React.ReactNode;
}

/**
 * The toolbar of the changelog page: the server-side filters supported by the
 * `get_resource_actions` API plus the pagination controls.
 *
 * @props {Props} props - The props of the component.
 * @returns {React.FC<Props>} The controls component.
 */
export const Controls: React.FC<Props> = ({ filter, setFilter, paginationWidget }) => (
  <Toolbar clearAllFilters={() => setFilter({})} collapseListedFiltersBreakpoint="xl">
    <ToolbarContent>
      <ToolbarItem>
        <SingleTextFilter
          filterPropertyName={words("resourceActions.filter.resourceType")}
          placeholder={words("resourceActions.filter.resourceType.placeholder")}
          value={filter.resource_type}
          update={(value) => setFilter({ ...filter, resource_type: value })}
        />
      </ToolbarItem>
      <ToolbarItem>
        <SingleTextFilter
          filterPropertyName={words("resourceActions.filter.agent")}
          placeholder={words("resourceActions.filter.agent.placeholder")}
          value={filter.agent}
          update={(value) => setFilter({ ...filter, agent: value })}
        />
      </ToolbarItem>
      <ToolbarItem>
        <SingleTextFilter
          filterPropertyName={words("resourceActions.filter.value")}
          placeholder={words("resourceActions.filter.value.placeholder")}
          value={filter.value}
          update={(value) => setFilter({ ...filter, value: value })}
        />
      </ToolbarItem>
      <ToolbarItem>
        <LogLevelFilter filter={filter} setFilter={setFilter} />
      </ToolbarItem>
      <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
    </ToolbarContent>
  </Toolbar>
);
