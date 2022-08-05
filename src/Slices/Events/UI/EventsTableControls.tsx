import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { Filter } from "@S/Events/Core/Query";
import { EventsFilterWidget } from "./FilterWidget";

interface Props {
  filter: Filter;
  setFilter: (filter: Filter) => void;
  paginationWidget: React.ReactNode;
  states: string[];
}

export const EventsTableControls: React.FC<Props> = ({
  filter,
  setFilter,
  paginationWidget,
  states,
}) => {
  return (
    <Toolbar
      clearAllFilters={() => setFilter({})}
      collapseListedFiltersBreakpoint="xl"
    >
      <ToolbarContent>
        <EventsFilterWidget
          filter={filter}
          setFilter={setFilter}
          states={states}
        />
        <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};
