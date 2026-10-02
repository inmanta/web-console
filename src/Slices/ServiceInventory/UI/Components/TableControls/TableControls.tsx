import React from "react";
import { Toolbar, ToolbarContent, ToolbarItem } from "@patternfly/react-core";
import { FilterToggleButton } from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  instanceSummary: React.ReactNode;
  paginationWidget: React.ReactNode;
  onToggleFilters: () => void;
  isDrawerExpanded: boolean;
  activeFilterCount: number;
}

/**
 * The TableControls component for the Service Inventory page.
 *
 * Renders the toolbar with the instance counts on the left, and the pagination widget and the
 * filter toggle button that opens the side-panel filter drawer on the right.
 *
 * @Props {Props} - Component props.
 *  @prop {React.ReactNode} instanceSummary - The instance counts of the service.
 *  @prop {React.ReactNode} paginationWidget - The pagination widget.
 *  @prop {() => void} onToggleFilters - The function to toggle the filter drawer.
 *  @prop {boolean} isDrawerExpanded - Whether the filter drawer is expanded.
 *  @prop {number} activeFilterCount - The number of active filters.
 *
 * @returns {React.ReactElement} The rendered table controls.
 */
export const TableControls: React.FC<Props> = ({
  instanceSummary,
  paginationWidget,
  onToggleFilters,
  isDrawerExpanded,
  activeFilterCount,
}) => {
  return (
    <Toolbar>
      <ToolbarContent alignItems="center">
        {instanceSummary && <ToolbarItem>{instanceSummary}</ToolbarItem>}
        <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
        <ToolbarItem>
          <FilterToggleButton
            onClick={onToggleFilters}
            isExpanded={isDrawerExpanded}
            activeFilterCount={activeFilterCount}
            label={words("filters")}
          />
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};
