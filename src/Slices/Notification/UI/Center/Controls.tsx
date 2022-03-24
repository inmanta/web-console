import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { Filter } from "@S/Notification/Core/Query";
import { MessageFilter } from "./MessageFilter";
import { ReadFilter } from "./ReadFilter";
import { SeverityFilter } from "./SeverityFilter";
import { TitleFilter } from "./TitleFilter";

interface Props {
  paginationWidget: React.ReactNode;
  filter: Filter;
  setFilter: (filter: Filter) => void;
}

export const Controls: React.FC<Props> = ({
  paginationWidget,
  filter,
  setFilter,
}) => (
  <Toolbar clearAllFilters={() => setFilter({})}>
    <ToolbarContent>
      <ToolbarItem>
        <SeverityFilter filter={filter} setFilter={setFilter} />
      </ToolbarItem>
      <ToolbarItem>
        <ReadFilter filter={filter} setFilter={setFilter} />
      </ToolbarItem>
      <ToolbarItem>
        <MessageFilter filter={filter} setFilter={setFilter} />
      </ToolbarItem>
      <ToolbarItem>
        <TitleFilter filter={filter} setFilter={setFilter} />
      </ToolbarItem>
      <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
    </ToolbarContent>
  </Toolbar>
);
