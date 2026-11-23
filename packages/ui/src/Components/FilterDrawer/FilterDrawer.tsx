import React from "react";
import { Drawer, DrawerContent, DrawerContentBody } from "@patternfly/react-core";

interface Props {
  isExpanded: boolean;
  panelContent: React.ReactNode;
  children: React.ReactNode;
  isInline?: boolean;
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
 * Renders the shared filter drawer: a side panel holding the filter widget next to the page
 * content, or over it when it isn't inline. Replaces the Drawer + DrawerContent +
 * DrawerContentBody boilerplate duplicated across the filtered pages.
 *
 * @Props {Props} - Component props.
 *  @prop {boolean} isExpanded - Whether the filter side panel is currently shown.
 *  @prop {React.ReactNode} panelContent - The filter widget rendered in the side panel.
 *  @prop {React.ReactNode} children - The main page content (table, empty view, ...) shown beside the panel.
 *  @prop {boolean} [isInline] - Whether the panel sits beside the content, which it narrows, or
 *   over it, PatternFly's overlay drawer. Defaults to true.
 *
 * @returns {React.ReactElement} The rendered filter drawer.
 */
export const FilterDrawer: React.FC<Props> = ({
  isExpanded,
  panelContent,
  children,
  isInline = true,
}) => (
  <Drawer isExpanded={isExpanded} isInline={isInline} style={drawerStyle}>
    <DrawerContent panelContent={panelContent}>
      <DrawerContentBody style={contentBodyStyle}>{children}</DrawerContentBody>
    </DrawerContent>
  </Drawer>
);
