import React from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { NotificationFilter } from "@/Data/Queries/V2/Notification/GetNotifications";
import { MessageFilter } from "./MessageFilter";
import { ReadFilter } from "./ReadFilter";
import { SeverityFilter } from "./SeverityFilter";
import { TitleFilter } from "./TitleFilter";

interface Props {
  paginationWidget: React.ReactNode;
  filter: NotificationFilter;
  setFilter: (filter: NotificationFilter) => void;
}

export const Controls: React.FC<Props> = ({ paginationWidget, filter, setFilter }) => (
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
