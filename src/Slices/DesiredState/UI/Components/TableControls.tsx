import React from "react";
import { Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem } from "@patternfly/react-core";
import { words } from "@/Core";
import { CompileWidget } from "@/UI/Components/CompileWidget";
import { FilterToggleButton } from "@/UI/Components/FilterDrawer";
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
          label={words("filters")}
        />
      </ToolbarItem>
    </ToolbarContent>
  </Toolbar>
);
