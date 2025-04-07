import React from "react";
import {
  Toolbar,
  ToolbarItem,
  ToolbarContent,
  Divider,
} from "@patternfly/react-core";
import { ResourceLogFilter } from "@S/ResourceDetails/Core/ResourceLog";
import { ActionFilter } from "./ActionFilter";
import { LogLevelFilter } from "./LogLevelFilter";
import { MessageFilter } from "./MessageFilter";
import { TimestampFilter } from "./TimestampFilter";

interface Props {
  paginationWidget: React.ReactNode;
  filter: ResourceLogFilter;
  setFilter: (filter: ResourceLogFilter) => void;
}

export const Controls: React.FC<Props> = ({
  paginationWidget,
  filter,
  setFilter,
}) => (
  <>
    <Toolbar clearAllFilters={() => setFilter({})}>
      <ToolbarContent>
        <ToolbarItem>
          <TimestampFilter filter={filter} setFilter={setFilter} />
        </ToolbarItem>
        <ToolbarItem variant="pagination">{paginationWidget}</ToolbarItem>
      </ToolbarContent>
      <Divider />
      <ToolbarContent>
        <ToolbarItem>
          <ActionFilter filter={filter} setFilter={setFilter} />
        </ToolbarItem>
        <ToolbarItem>
          <LogLevelFilter filter={filter} setFilter={setFilter} />
        </ToolbarItem>
        <ToolbarItem>
          <MessageFilter filter={filter} setFilter={setFilter} />
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  </>
);
