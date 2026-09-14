import React from "react";
import { Drawer, DrawerContent, DrawerContentBody } from "@patternfly/react-core";

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
