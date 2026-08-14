import React from "react";
import { Toolbar, ToolbarContent, ToolbarItem } from "@patternfly/react-core";
import { FilterToggleButton } from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  paginationWidget: React.ReactNode;
  onToggleFilters: () => void;
  isDrawerExpanded: boolean;
  activeFilterCount: number;
}

/**
 * The TableControls component for the Service Inventory page.
 *
 * Renders the toolbar with the pagination widget and the filter toggle button that opens the
 * side-panel filter drawer. The "Add instance" action lives separately in the page header (see
 * AddInstanceButton).
 *
 * @Props {Props} - Component props.
 *  @prop {React.ReactNode} paginationWidget - The pagination widget.
 *  @prop {() => void} onToggleFilters - The function to toggle the filter drawer.
 *  @prop {boolean} isDrawerExpanded - Whether the filter drawer is expanded.
 *  @prop {number} activeFilterCount - The number of active filters.
 *
 * @returns {React.ReactElement} The rendered table controls.
 */
export const TableControls: React.FC<Props> = ({
  paginationWidget,
  onToggleFilters,
  isDrawerExpanded,
  activeFilterCount,
}) => {
  return (
    <Toolbar>
      <ToolbarContent>
        <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
        <ToolbarItem>
          <FilterToggleButton
            onClick={onToggleFilters}
            isExpanded={isDrawerExpanded}
            activeFilterCount={activeFilterCount}
            label={words("inventory.filters")}
          />
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};
