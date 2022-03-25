import React, { useState } from "react";
import { Toolbar, ToolbarContent, ToolbarItem } from "@patternfly/react-core";
import { Resource } from "@/Core";
import { DeployStateFilter } from "./DeployStateFilter";

export default {
  title: "DeployStateFilter",
  component: DeployStateFilter,
};

export const Default = () => {
  const [filter, setFilter] = useState<Resource.FilterWithDefaultHandling>({});
  return (
    <Toolbar clearAllFilters={() => setFilter({})}>
      <ToolbarContent>
        <ToolbarItem>
          <DeployStateFilter filter={filter} setFilter={setFilter} />
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};
