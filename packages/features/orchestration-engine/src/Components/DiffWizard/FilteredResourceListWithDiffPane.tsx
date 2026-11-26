import React, { useCallback, useMemo, useState } from "react";
import {
  Content,
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
  resources: Diff.Resource[];
  route: RouteKind;
}

/**
 * The resources of a diff with their filters: above the list, how many resources show and how
 * many the status filters hide, and the toggle of the filter drawer, which opens over the list and
 * diff pane. The filters are kept in the URL of the route.
 *
 * @props {Props} props - The component props
 *  @prop {Diff.Resource[]} resources - All resources of the diff, before filtering
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
    () => getFilteredDiffResources(resources, filterWithDefaults).map(fromResourceToItem),
    [resources, filterWithDefaults]
  );
  const statusCounts = useMemo(() => getDiffStatusCounts(resources), [resources]);
  const hiddenByStatusCount = getHiddenByStatusCount(statusCounts, filterWithDefaults.status ?? []);
  const onCloseDrawer = useCallback(() => setIsDrawerExpanded(false), []);
  const onResetFilters = hasAnySetValue(filter) ? () => setFilter({}) : undefined;

  return (
    <Stack style={{ height: "100%" }}>
      <StackItem>
        <Toolbar>
          <ToolbarContent style={{ padding: 0 }}>
            <ToolbarItem alignSelf="center">
              <Content component="p">
                {words("desiredState.compare.filters.resourceCount")(
                  items.length,
                  hiddenByStatusCount
                )}
              </Content>
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
