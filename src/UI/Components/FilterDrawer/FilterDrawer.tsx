import React from "react";
import { Drawer, DrawerContent, DrawerContentBody } from "@patternfly/react-core";

/**
 * Props for the FilterDrawer component.
 *
 * isExpanded - whether the filter side panel is currently shown.
 * panelContent - the filter widget rendered in the side panel, e.g. a ConnectedFilterWidget.
 * children - the main page content (table, empty view, ...) shown beside the panel.
 */
interface Props {
  isExpanded: boolean;
  panelContent: React.ReactNode;
  children: React.ReactNode;
}

const drawerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  flex: "1 1 auto",
};

const contentBodyStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  flex: "1 1 auto",
  minHeight: 0,
};

/**
 * Renders the shared inline filter drawer: a side panel holding the filter widget next to the page content.
 * Replaces the Drawer + DrawerContent + DrawerContentBody boilerplate duplicated across the filtered pages.
 *
 * @example
 * <FilterDrawer isExpanded={isDrawerExpanded} panelContent={<ConnectedFilterWidget onClose={onClose} />}>
 *   <ResourcesTable rows={rows} />
 * </FilterDrawer>
 */
export const FilterDrawer: React.FC<Props> = ({ isExpanded, panelContent, children }) => (
  <Drawer isExpanded={isExpanded} isInline style={drawerStyle}>
    <DrawerContent panelContent={panelContent}>
      <DrawerContentBody style={contentBodyStyle}>{children}</DrawerContentBody>
    </DrawerContent>
  </Drawer>
);
