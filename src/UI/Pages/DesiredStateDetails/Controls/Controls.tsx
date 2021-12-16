import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { VersionResourceFilter } from "@/Core";

interface Props {
  paginationWidget: React.ReactNode;
  filter: VersionResourceFilter;
  setFilter: (filter: VersionResourceFilter) => void;
}

export const Controls: React.FC<Props> = ({ paginationWidget, setFilter }) => (
  <Toolbar clearAllFilters={() => setFilter({})}>
    <ToolbarContent>
      <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
    </ToolbarContent>
  </Toolbar>
);
