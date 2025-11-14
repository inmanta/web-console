import React from "react";
import {
  Badge,
  Button,
  Flex,
  FlexItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";
import { FilterIcon } from "@patternfly/react-icons";
import { words } from "@/UI";

interface Props {
  summaryWidget: React.ReactNode;
  paginationWidget: React.ReactNode;
  onToggleFilters: () => void;
  isDrawerExpanded: boolean;
  activeFilterCount: number;
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
 */
export const ResourceTableControls: React.FC<Props> = ({
  summaryWidget,
  paginationWidget,
  onToggleFilters,
  isDrawerExpanded,
  activeFilterCount,
}) => (
  <>
    <Toolbar aria-label="Resources-toolbar">
      <ToolbarContent>
        {summaryWidget}
        <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
        <ToolbarItem>
          <Button
            onClick={onToggleFilters}
            variant="link"
            icon={<FilterIcon />}
            iconPosition="end"
            aria-pressed={isDrawerExpanded}
          >
            <Flex
              alignItems={{ default: "alignItemsCenter" }}
              spaceItems={{ default: "spaceItemsSm" }}
            >
              <FlexItem>
                <Badge>{activeFilterCount}</Badge>
              </FlexItem>
              <FlexItem>{words("resources.filters")}</FlexItem>
            </Flex>
          </Button>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  </>
);
