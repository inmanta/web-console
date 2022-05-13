import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";

interface Props {
  paginationWidget: React.ReactNode;
}

export const ResourcTableControlV2: React.FC<Props> = ({
  paginationWidget,
}) => (
  <>
    <Toolbar aria-label="Resources-toolbar">
      <ToolbarContent>
        <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  </>
);
