import React, { useCallback, useMemo, useState } from "react";
import {
  Content,
  Skeleton,
  Stack,
  StackItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";
import { Diff, RouteKind, hasAnySetValue, words } from "@inmanta/web-console-core";
import { useUrlStateWithFilter } from "@inmanta/web-console-core/Common";
import {
  FilterDrawer,
  FilterToggleButton,
  countActiveFilters,
} from "@inmanta/web-console-ui/Components/FilterDrawer";
import { DiffFilterWidget } from "./DiffFilterWidget";
import { ResourceListWithDiffPane } from "./ResourceListWithDiffPane";
import { fromResourceToItem } from "./fromResourceToItem";
import {
  getDiffFilterWithDefaults,
  getDiffStatusCounts,
  getFilteredDiffResources,
  getHiddenByStatusCount,
} from "./helpers";
import { DIFF_FILTER_URL_KEYS, DiffFilter, DiffSideLabels } from "./types";

interface Props extends DiffSideLabels {
  resources: Diff.Resource[] | undefined;
  route: RouteKind;
}

/**
 * The resources of a diff with their filters: above the list, how many resources show and how
 * many the status filters hide, and the toggle of the filter drawer, which opens over the list and
 * diff pane. The filters are kept in the URL of the route. While the diff loads, the count and the
 * list and pane show loading placeholders, and the filters stay usable.
 *
 * @props {Props} props - The component props
 *  @prop {Diff.Resource[] | undefined} resources - All resources of the diff, before filtering; undefined while the diff loads
 *  @prop {RouteKind} route - The page whose URL keeps the filters and the selected resource
 *  @prop {string} fromLabel - The display text of the side the diff starts from, e.g. "Current state"
 *  @prop {string} toLabel - The display text of the side the diff goes to, e.g. "v412"
 *
 * @returns {React.FC<Props>} The filtered resource list with the diff pane
 */
export const FilteredResourceListWithDiffPane: React.FC<Props> = ({
  resources,
  route,
  fromLabel,
  toLabel,
}) => {
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const [filter, setFilter] = useUrlStateWithFilter<DiffFilter>({
    route,
    keys: DIFF_FILTER_URL_KEYS,
  });

  const filterWithDefaults = useMemo(() => getDiffFilterWithDefaults(filter), [filter]);
  const items = useMemo(
    () =>
      resources
        ? getFilteredDiffResources(resources, filterWithDefaults).map(fromResourceToItem)
        : undefined,
    [resources, filterWithDefaults]
  );
  const statusCounts = useMemo(
    () => (resources ? getDiffStatusCounts(resources) : undefined),
    [resources]
  );
  const onCloseDrawer = useCallback(() => setIsDrawerExpanded(false), []);
  const onResetFilters = hasAnySetValue(filter) ? () => setFilter({}) : undefined;

  return (
    <Stack style={{ height: "100%" }}>
      <StackItem>
        <Toolbar>
          <ToolbarContent style={{ padding: 0 }}>
            <ToolbarItem alignSelf="center">
              {items && statusCounts ? (
                <Content component="p">
                  {words("desiredState.compare.filters.resourceCount")(
                    items.length,
                    getHiddenByStatusCount(statusCounts, filterWithDefaults.status ?? [])
                  )}
                </Content>
              ) : (
                <Skeleton fontSize="sm" width="10rem" />
              )}
            </ToolbarItem>
            <ToolbarItem align={{ default: "alignEnd" }}>
              <FilterToggleButton
                onClick={() => setIsDrawerExpanded((isExpanded) => !isExpanded)}
                isExpanded={isDrawerExpanded}
                activeFilterCount={countActiveFilters(filterWithDefaults)}
                label={words("filters")}
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </StackItem>
      <StackItem isFilled style={{ minHeight: 0, display: "flex", flexDirection: "column" }}>
        <FilterDrawer
          isInline={false}
          isExpanded={isDrawerExpanded}
          panelContent={
            <DiffFilterWidget
              filter={filterWithDefaults}
              setFilter={setFilter}
              statusCounts={statusCounts}
              onClose={onCloseDrawer}
            />
          }
        >
          <ResourceListWithDiffPane
            items={items}
            route={route}
            fromLabel={fromLabel}
            toLabel={toLabel}
            onResetFilters={onResetFilters}
          />
        </FilterDrawer>
      </StackItem>
    </Stack>
  );
};
