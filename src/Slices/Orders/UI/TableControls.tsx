import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";

interface Props {
  paginationWidget: React.ReactNode;
}

export const TableControls: React.FC<Props> = ({ paginationWidget }) => {
  return (
    <Toolbar>
      <ToolbarContent>
        <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};
