import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent, ToolbarGroup } from "@patternfly/react-core";
import { Filter } from "@/Slices/DesiredState/Core/Types";
import { CompileWidget } from "@/UI/Components";
import { CompareSelectionWidget } from "./CompareSelectionWidget";
import { FilterWidget } from "./FilterWidget";

interface Props {
  filter: Filter;
  setFilter: (filter: Filter) => void;
  paginationWidget: React.ReactNode;
}

export const TableControls: React.FC<Props> = ({ filter, setFilter, paginationWidget }) => (
  <Toolbar clearAllFilters={() => setFilter({})} collapseListedFiltersBreakpoint="xl">
    <ToolbarContent>
      <FilterWidget filter={filter} setFilter={setFilter} />
      <ToolbarItem variant="separator" />
      <ToolbarGroup>
        <CompileWidget/>
      </ToolbarGroup>
      <ToolbarGroup>
        <CompareSelectionWidget />
      </ToolbarGroup>
      <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
    </ToolbarContent>
  </Toolbar>
);
