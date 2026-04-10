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
        <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
        <ToolbarItem>
          <Button
            onClick={onToggleFilters}
            variant="link"
            icon={
              <FilterIcon
                {...(noResourcesFound && {
                  style: { color: "var(--pf-t--color--red--60)" },
                })}
              />
            }
            iconPosition="end"
            aria-pressed={isDrawerExpanded}
          >
            <Flex
              alignItems={{ default: "alignItemsCenter" }}
              spaceItems={{ default: "spaceItemsSm" }}
            >
              <FlexItem>
                <Badge
                  {...(noResourcesFound && {
                    style: { backgroundColor: "var(--pf-t--color--red--60)" },
                  })}
                >
                  {activeFilterCount}
                </Badge>
              </FlexItem>
              <FlexItem
                {...(noResourcesFound && {
                  style: { color: "var(--pf-t--color--red--60)" },
                })}
              >
                {words("resources.filters")}
              </FlexItem>
            </Flex>
          </Button>
        </ToolbarItem>
      </Flex>
    </ToolbarContent>
  </Toolbar>
);
