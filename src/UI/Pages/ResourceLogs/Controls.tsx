import { Toolbar, ToolbarContent, ToolbarItem } from "@patternfly/react-core";
import React from "react";

interface Props {
  paginationWidget: React.ReactNode;
}

export const Controls: React.FC<Props> = ({ paginationWidget }) => (
  <Toolbar>
    <ToolbarContent>
      <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
    </ToolbarContent>
  </Toolbar>
);
