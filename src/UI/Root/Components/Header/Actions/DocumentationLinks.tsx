import React, { useContext } from "react";
import { Button, ToolbarItem, Tooltip } from "@patternfly/react-core";
import {
  FileCodeIcon,
  OutlinedQuestionCircleIcon,
} from "@patternfly/react-icons";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

export const DocumentationLinks: React.FC = () => {
  const { urlManager } = useContext(DependencyContext);
  return (
    <ToolbarItem>
      <Tooltip
        content={words("dashboard.documentation.tooltip")}
        position="bottom"
        entryDelay={500}
      >
        <Button
          component="a"
          href={urlManager.getDocumentationLink()}
          target="_blank"
          aria-label="documentation link"
          variant="plain"
        >
          <OutlinedQuestionCircleIcon />
        </Button>
      </Tooltip>
      <Tooltip
        content={words("dashboard.API.tooltip")}
        position="bottom"
        entryDelay={500}
      >
        <Button
          component="a"
          href={urlManager.getGeneralAPILink()}
          target="_blank"
          aria-label="general API link"
          variant="plain"
        >
          <FileCodeIcon />
        </Button>
      </Tooltip>
    </ToolbarItem>
  );
};
