import React, { useContext } from "react";
import { Button, ToolbarItem, Tooltip } from "@patternfly/react-core";
import { CogIcon } from "@patternfly/react-icons";
import { Link } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

export const SettingsButton: React.FC = () => {
  const { routeManager } = useContext(DependencyContext);
  return (
    <ToolbarItem>
      <Tooltip
        content={words("dashboard.setting.tooltip")}
        position="bottom"
        entryDelay={500}
      >
        <Link pathname={routeManager.getUrl("Settings", undefined)} envOnly>
          <Button aria-label="Settings actions" variant="plain">
            <CogIcon />
          </Button>
        </Link>
      </Tooltip>
    </ToolbarItem>
  );
};
