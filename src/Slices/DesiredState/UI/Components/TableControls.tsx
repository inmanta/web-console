import React from "react";
import { Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem } from "@patternfly/react-core";
import { CompileWidget, FilterToggleButton } from "@/UI/Components";
import { words } from "@/UI/words";
import { CompareSelectionWidget } from "./CompareSelectionWidget";

interface Props {
  paginationWidget: React.ReactNode;
  onToggleFilters: () => void;
  isDrawerExpanded: boolean;
  activeFilterCount: number;
}

export const TableControls: React.FC<Props> = ({
  paginationWidget,
  onToggleFilters,
  isDrawerExpanded,
  activeFilterCount,
}) => (
  <Toolbar>
    <ToolbarContent>
      <ToolbarGroup>
        <CompileWidget />
      </ToolbarGroup>
      <ToolbarGroup>
        <CompareSelectionWidget />
      </ToolbarGroup>
      <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
      <ToolbarItem>
        <FilterToggleButton
          onClick={onToggleFilters}
          isExpanded={isDrawerExpanded}
          activeFilterCount={activeFilterCount}
          label={words("desiredState.filters")}
        />
      </ToolbarItem>
    </ToolbarContent>
  </Toolbar>
);
