import React, { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
  Panel,
} from "@patternfly/react-core";
import styled from "styled-components";
import { RouteKind, words } from "@inmanta/web-console-core";
import { useUrlStateWithString } from "@inmanta/web-console-core/Common";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";
import { DiffPane } from "./DiffPane";
import { ResourceList } from "./ResourceList";
import { getResourceListGroups, getResourceListItems } from "./helpers";
import { DiffSideLabels, Item, SELECTED_RESOURCE_URL_STATE_KEY } from "./types";

interface Props extends DiffSideLabels {
  items: Item[];
  route: RouteKind;
}

/**
 * The resources of a diff in a bordered panel: the resource list on the left, the diff of the
 * selected resource in a resizable pane on the right. The selected resource is kept in the URL of
 * the route; without one, or when it is filtered out, the first resource in the list shows. The
 * panel fills the height its parent gives it, and the list and pane scroll on their own.
 *
 * @props {Props} props - The component props
 *  @prop {Item[]} items - The resources and their changes, after filtering
 *  @prop {RouteKind} route - The page whose URL keeps the selected resource
 *  @prop {string} fromLabel - The display text of the side the diff starts from, e.g. "Current state"
 *  @prop {string} toLabel - The display text of the side the diff goes to, e.g. "v412"
 *
 * @returns {React.FC<Props>} The resource list with the diff pane
 */
export const ResourceListWithDiffPane: React.FC<Props> = ({ items, route, fromLabel, toLabel }) => {
  const [selectedResourceId, setSelectedResourceId] = useUrlStateWithString<string>({
    default: "",
    key: SELECTED_RESOURCE_URL_STATE_KEY,
    route,
  });

  // The setter is a new function on every render; a stable callback keeps the memoized list and
  // pane from redrawing on each render of the page.
  // TODO(#7977): pass the setter straight on once useUrlState returns a stable one.
  const setSelectedResourceIdRef = useRef(setSelectedResourceId);

  useLayoutEffect(() => {
    setSelectedResourceIdRef.current = setSelectedResourceId;
  });

  const onSelect = useCallback(
    (resourceId: string) => setSelectedResourceIdRef.current(resourceId),
    []
  );

  const groups = useMemo(() => getResourceListGroups(items), [items]);
  const listedItems = useMemo(() => getResourceListItems(groups), [groups]);

  if (listedItems.length === 0) {
    return <EmptyView message={words("noResults")} aria-label="ResourceListWithDiffPane-Empty" />;
  }

  const selectedIndex = Math.max(
    listedItems.findIndex((item) => item.id === selectedResourceId),
    0
  );
  const selectedItem = listedItems[selectedIndex];

  return (
    <OutlinedPanel variant="bordered">
      <Drawer isStatic isExpanded>
        <DrawerContent
          panelContent={
            <DrawerPanelContent isResizable defaultSize="65%" minSize="400px">
              <DiffPane
                item={selectedItem}
                previousResourceId={listedItems[selectedIndex - 1]?.id ?? null}
                nextResourceId={listedItems[selectedIndex + 1]?.id ?? null}
                onSelect={onSelect}
                fromLabel={fromLabel}
                toLabel={toLabel}
              />
            </DrawerPanelContent>
          }
        >
          <DrawerContentBody>
            <ResourceList
              groups={groups}
              listedItems={listedItems}
              selectedIndex={selectedIndex}
              onSelect={onSelect}
            />
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </OutlinedPanel>
  );
};

/**
 * The bordered panel at the height its parent gives it, with its border drawn above the layers of
 * the drawer, whose backgrounds would hide it, and the corners of the list and pane clipped to its
 * rounded corners.
 *
 * @note This raises PatternFly's `.pf-v6-c-panel::before` border, so check it on a PatternFly
 * major upgrade.
 */
const OutlinedPanel = styled(Panel)`
  height: 100%;
  overflow: hidden;

  &::before {
    z-index: var(--pf-t--global--z-index--md);
  }
`;
