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

interface Props {
  summaryWidget: React.ReactNode;
  paginationWidget: React.ReactNode;
  onToggleFilters: () => void;
  isDrawerExpanded: boolean;
  activeFilterCount: number;
}

export const ResourceTableControls: React.FC<Props> = ({
  summaryWidget,
  paginationWidget,
  onToggleFilters,
  isDrawerExpanded,
  activeFilterCount,
}) => (
  <>
    <Toolbar
      aria-label="Resources-toolbar"
    >
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
            <Flex alignItems={{ default: "alignItemsCenter" }} spaceItems={{ default: "spaceItemsSm" }}>
              <FlexItem>
                <Badge>{activeFilterCount}</Badge>
              </FlexItem>
              <FlexItem>Filters</FlexItem>
            </Flex>
          </Button>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  </>
);
