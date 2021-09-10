import React from "react";
import {
  Toolbar,
  ToolbarItem,
  ToolbarContent,
  Divider,
} from "@patternfly/react-core";
import { ActionFilter } from "./ActionFilter";
import { ResourceLogFilter } from "@/Core/Domain/Query";
import { LogLevelFilter } from "./LogLevelFilter";

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
        {/* <ToolbarItem>
          <DeployStateFilter filter={filter} setFilter={setFilter} />
        </ToolbarItem> */}
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
      </ToolbarContent>
    </Toolbar>
  </>
);
