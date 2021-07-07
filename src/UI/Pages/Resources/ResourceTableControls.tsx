import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { ResourceParams } from "@/Core";
import { FilterWidget } from "./FilterWidget";

interface Props {
  paginationWidget: React.ReactNode;
  filter: ResourceParams.Filter;
  setFilter: (filter: ResourceParams.Filter) => void;
}

export const ResourceTableControls: React.FC<Props> = ({
  paginationWidget,
  filter,
  setFilter,
}) => {
  return (
    <Toolbar clearAllFilters={() => setFilter({})}>
      <ToolbarContent>
        <FilterWidget filter={filter} setFilter={setFilter} />
        <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};
