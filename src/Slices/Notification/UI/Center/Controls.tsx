import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { Filter } from "@S/Notification/Core/Query";
import { SeverityFilter } from "./SeverityFilter";

interface Props {
  paginationWidget: React.ReactNode;
  filter: Filter;
  setFilter: (filter: Filter) => void;
}

export const Controls: React.FC<Props> = ({
  paginationWidget,
  filter,
  setFilter,
}) => (
  <Toolbar clearAllFilters={() => setFilter({})}>
    <ToolbarContent>
      <ToolbarItem>
        <SeverityFilter filter={filter} setFilter={setFilter} />
      </ToolbarItem>
      <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
    </ToolbarContent>
  </Toolbar>
);
