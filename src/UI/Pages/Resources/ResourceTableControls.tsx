import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { LatestReleasedResourceParams } from "@/Core";
import { FilterWidget } from "./FilterWidget";

interface Props {
  paginationWidget: React.ReactNode;
  filter: LatestReleasedResourceParams.Filter;
  setFilter: (filter: LatestReleasedResourceParams.Filter) => void;
}

export const ResourceTableControls: React.FC<Props> = ({
  paginationWidget,
  filter,
  setFilter,
}) => {
  return (
    <Toolbar clearAllFilters={() => setFilter({})}>
      <ToolbarContent>
        <FilterWidget filter={filter} setFilter={setFilter} />
        <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};
