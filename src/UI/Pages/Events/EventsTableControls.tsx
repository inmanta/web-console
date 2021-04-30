import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { EventParams } from "@/Core";
import { EventsFilterWidget } from "./FilterWidget";

interface Props {
  filter: EventParams.Filter;
  setFilter: (filter: EventParams.Filter) => void;
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
