import React from "react";
import { Flex, Toolbar, ToolbarContent, ToolbarItem } from "@patternfly/react-core";
import { FilterToggleButton } from "@/UI/Components";
import { words } from "@/UI";

interface Props {
  summaryWidget: React.ReactNode;
  paginationWidget: React.ReactNode;
  onToggleFilters: () => void;
  isDrawerExpanded: boolean;
  activeFilterCount: number;
  noResourcesFound: boolean;
}

/**
 * The ResourceTableControls component.
 *
 * This component is responsible of displaying the table controls.
 *
 * @Props {Props} - The props of the component
 *  @prop {React.ReactNode} summaryWidget - The summary widget
 *  @prop {React.ReactNode} paginationWidget - The pagination widget
 *  @prop {() => void} onToggleFilters - The function to toggle the filters
 *  @prop {boolean} isDrawerExpanded - Whether the drawer is expanded
 *  @prop {number} activeFilterCount - The number of active filters
 *  @props {boolean} noResourcesFound - Whether there are no resources found with the current filters
 */
export const ResourceTableControls: React.FC<Props> = ({
  summaryWidget,
  paginationWidget,
  onToggleFilters,
  isDrawerExpanded,
  activeFilterCount,
  noResourcesFound,
}) => (
  <Toolbar aria-label="Resources-toolbar" style={{ paddingBlockEnd: 0 }}>
    <ToolbarContent>
      <Flex style={{ width: "100%" }} alignItems={{ default: "alignItemsFlexEnd" }}>
        {summaryWidget}
        <ToolbarItem variant="pagination" style={{ justifyContent: "flex-end", minWidth: "320px" }}>
          {paginationWidget}
        </ToolbarItem>
        <ToolbarItem>
          <FilterToggleButton
            onClick={onToggleFilters}
            isExpanded={isDrawerExpanded}
            activeFilterCount={activeFilterCount}
            label={words("resources.filters")}
            isDanger={noResourcesFound}
          />
        </ToolbarItem>
      </Flex>
    </ToolbarContent>
  </Toolbar>
);
