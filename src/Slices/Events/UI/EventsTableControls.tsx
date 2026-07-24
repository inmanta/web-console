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
 * The EventsTableControls component.
 *
 * Renders the Events table toolbar: the pagination widget and a toggle button
 * that opens the filter side panel, showing the number of active filters.
 *
 * @Props {Props} - Component props.
 *  @prop {React.ReactNode} paginationWidget - The pagination widget.
 *  @prop {() => void} onToggleFilters - Toggles the filter side panel.
 *  @prop {boolean} isDrawerExpanded - Whether the filter side panel is expanded.
 *  @prop {number} activeFilterCount - The number of active filters.
 */
export const EventsTableControls: React.FC<Props> = ({
  paginationWidget,
  onToggleFilters,
  isDrawerExpanded,
  activeFilterCount,
}) => (
  <Toolbar aria-label="Events-toolbar">
    <ToolbarContent>
      <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
      <ToolbarItem>
        <FilterToggleButton
          onClick={onToggleFilters}
          isExpanded={isDrawerExpanded}
          activeFilterCount={activeFilterCount}
          label={words("events.filters")}
        />
      </ToolbarItem>
    </ToolbarContent>
  </Toolbar>
);
