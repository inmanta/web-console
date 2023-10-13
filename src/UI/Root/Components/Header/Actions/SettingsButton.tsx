import React, { useContext } from "react";
import { Button } from "@patternfly/react-core";
import { PageHeaderToolsItem } from "@patternfly/react-core/deprecated";
import { CogIcon } from "@patternfly/react-icons";
import { Link } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";

export const SettingsButton: React.FC = () => {
  const { routeManager } = useContext(DependencyContext);
  return (
    <PageHeaderToolsItem>
      <Link pathname={routeManager.getUrl("Settings", undefined)} envOnly>
        <Button aria-label="Settings actions" variant="plain">
          <CogIcon />
        </Button>
      </Link>
    </PageHeaderToolsItem>
  );
};
