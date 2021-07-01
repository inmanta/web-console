import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";

interface Props {
  paginationWidget: React.ReactNode;
}

export const ResourceTableControls: React.FC<Props> = ({
  paginationWidget,
}) => (
  <Toolbar>
    <ToolbarContent>
      <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
    </ToolbarContent>
  </Toolbar>
);
