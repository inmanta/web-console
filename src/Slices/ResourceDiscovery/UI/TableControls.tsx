import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { Filter } from "@/Data/Queries";
import { FilterForm } from "@/UI/Components";

interface Props {
  paginationWidget: React.ReactNode;
  filter: Filter;
  setFilter: (filter: Filter) => void;
}

/**
 * The TableControls component.
 *
 * This component is responsible of displaying the table controls.
 *
 * @Props {Props} - The props of the component
 *  @prop {React.ReactNode} paginationWidget - The pagination widget
 *
 * @returns {React.FC} TableControls component
 */
export const TableControls: React.FC<Props> = ({ paginationWidget, filter, setFilter }) => {
  return (
    <Toolbar clearAllFilters={() => setFilter({})} aria-label="DiscoveredResources-toolbar">
      <ToolbarContent>
        <FilterForm filter={filter} setFilter={setFilter} />
        <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};
