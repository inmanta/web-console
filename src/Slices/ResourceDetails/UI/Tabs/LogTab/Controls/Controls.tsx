import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { FilterToggleButton } from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  paginationWidget: React.ReactNode;
  onToggleFilters: () => void;
  isDrawerExpanded: boolean;
  activeFilterCount: number;
}

/**
 * The Controls component.
 *
 * Renders the resource logs table toolbar: the pagination widget and a toggle button
 * that opens the filter side panel, showing the number of active filters.
 *
 * @Props {Props} - Component props.
 *  @prop {React.ReactNode} paginationWidget - The pagination widget.
 *  @prop {() => void} onToggleFilters - Toggles the filter side panel.
 *  @prop {boolean} isDrawerExpanded - Whether the filter side panel is expanded.
 *  @prop {number} activeFilterCount - The number of active filters.
 */
export const Controls: React.FC<Props> = ({
  paginationWidget,
  onToggleFilters,
  isDrawerExpanded,
  activeFilterCount,
}) => (
  <Toolbar aria-label="ResourceLogs-toolbar">
    <ToolbarContent>
      <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
      <ToolbarItem>
        <FilterToggleButton
          onClick={onToggleFilters}
          isExpanded={isDrawerExpanded}
          activeFilterCount={activeFilterCount}
          label={words("resources.logs.filters")}
        />
      </ToolbarItem>
    </ToolbarContent>
  </Toolbar>
);
