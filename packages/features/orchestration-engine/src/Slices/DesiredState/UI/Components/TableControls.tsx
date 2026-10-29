import React from "react";
import { Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem } from "@patternfly/react-core";
import { words } from "@inmanta/web-console-core";
import { CompileWidget } from "@inmanta/web-console-feature-orchestration-engine/Components/CompileWidget";
import { FilterToggleButton } from "@inmanta/web-console-ui/Components/FilterDrawer";
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
