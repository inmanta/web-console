import React, { useContext } from "react";
import { Button, PageHeaderToolsItem } from "@patternfly/react-core";
import { RunningIcon } from "@patternfly/react-icons";
import { Link } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";

export const StatusButton: React.FC = () => {
  const { routeManager } = useContext(DependencyContext);
  return (
    <PageHeaderToolsItem>
      <Link pathname={routeManager.getUrl("Status", undefined)} envOnly>
        <Button aria-label="ServerStatus action" variant="plain">
          <RunningIcon />
        </Button>
      </Link>
    </PageHeaderToolsItem>
  );
};
