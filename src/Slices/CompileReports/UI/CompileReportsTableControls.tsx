import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { CompileWidget, FilterToggleButton } from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  paginationWidget: React.ReactNode;
  afterRecompile(): void;
  onToggleFilters: () => void;
  isDrawerExpanded: boolean;
  activeFilterCount: number;
}

/**
 * The CompileReportsTableControls component.
 *
 * Renders the Compile Reports table toolbar: a toggle button that opens the filter
 * side panel (showing the number of active filters), the recompile widget and the
 * pagination widget.
 *
 * @Props {Props} - Component props.
 *  @prop {React.ReactNode} paginationWidget - The pagination widget.
 *  @prop {() => void} afterRecompile - Callback executed after a recompile is triggered.
 *  @prop {() => void} onToggleFilters - Toggles the filter side panel.
 *  @prop {boolean} isDrawerExpanded - Whether the filter side panel is expanded.
 *  @prop {number} activeFilterCount - The number of active filters.
 */
export const CompileReportsTableControls: React.FC<Props> = ({
  paginationWidget,
  afterRecompile,
  onToggleFilters,
  isDrawerExpanded,
  activeFilterCount,
}) => {
  return (
    <Toolbar aria-label="CompileReports-toolbar">
      <ToolbarContent>
        <CompileWidget afterTrigger={afterRecompile} />
        <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
        <ToolbarItem>
          <FilterToggleButton
            onClick={onToggleFilters}
            isExpanded={isDrawerExpanded}
            activeFilterCount={activeFilterCount}
            label={words("compileReports.filters")}
          />
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};
