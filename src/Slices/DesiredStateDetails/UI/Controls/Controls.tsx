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
import { words } from "@/UI/words";

interface Props {
  paginationWidget: React.ReactNode;
  onToggleFilters: () => void;
  isDrawerExpanded: boolean;
  activeFilterCount: number;
}

export const Controls: React.FC<Props> = ({
  paginationWidget,
  onToggleFilters,
  isDrawerExpanded,
  activeFilterCount,
}) => (
  <Toolbar aria-label="DesiredStateDetails-toolbar">
    <ToolbarContent>
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
);
