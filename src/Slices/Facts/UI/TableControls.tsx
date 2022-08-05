import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { FreeTextFilter } from "@/UI/Components";
import { words } from "@/UI/words";
import { Filter } from "@S/Facts/Core/Query";

interface Props {
  filter: Filter;
  setFilter: (filter: Filter) => void;
  paginationWidget: React.ReactNode;
}

export const TableControls: React.FC<Props> = ({
  filter,
  setFilter,
  paginationWidget,
}) => {
  const updateName = (names: string[]) =>
    setFilter({ ...filter, name: names.length > 0 ? names : undefined });

  const updateResourceId = (ids: string[]) =>
    setFilter({ ...filter, resource_id: ids.length > 0 ? ids : undefined });

  return (
    <Toolbar
      clearAllFilters={() => setFilter({})}
      collapseListedFiltersBreakpoint="xl"
    >
      <ToolbarContent>
        <FreeTextFilter
          filterPropertyName={"Name"}
          searchEntries={filter.name}
          update={updateName}
          placeholder={words("facts.filters.name.placeholder")}
        />
        <FreeTextFilter
          filterPropertyName={"Resource Id"}
          searchEntries={filter.resource_id}
          update={updateResourceId}
          placeholder={words("facts.filters.resourceId.placeholder")}
        />
        <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};
