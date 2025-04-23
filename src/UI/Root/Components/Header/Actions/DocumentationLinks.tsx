import React, { useContext } from "react";
import { Link } from "react-router";
import { Button, ToolbarItem, Tooltip } from "@patternfly/react-core";
import { BookIcon, FileCodeIcon } from "@patternfly/react-icons";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

export const DocumentationLinks: React.FC = () => {
  const { urlManager } = useContext(DependencyContext);

  return (
    <>
      <ToolbarItem>
        <Tooltip
          content={words("dashboard.documentation.tooltip")}
          position="bottom"
          entryDelay={500}
        >
          <Link to={urlManager.getDocumentationLink()} target="_blank">
            <Button icon={<BookIcon />} aria-label="documentation link" variant="plain" />
          </Link>
        </Tooltip>
      </ToolbarItem>
      <ToolbarItem>
        <Tooltip content={words("dashboard.API.tooltip")} position="bottom" entryDelay={500}>
          <Link to={urlManager.getGeneralAPILink()} target="_blank">
            <Button icon={<FileCodeIcon />} aria-label="general API link" variant="plain" />
          </Link>
        </Tooltip>
      </ToolbarItem>
    </>
  );
};
