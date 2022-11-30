import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { Resource } from "@/Core";
import { FilterForm } from "@/UI/Components";

interface Props {
  paginationWidget: React.ReactNode;
  filter: Resource.Filter;
  setFilter: (filter: Resource.Filter) => void;
}

export const Controls: React.FC<Props> = ({
  paginationWidget,
  filter,
  setFilter,
}) => (
  <>
    <Toolbar clearAllFilters={() => setFilter({})}>
      <ToolbarContent>
        <FilterForm filter={filter} setFilter={setFilter} />
        <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  </>
);
