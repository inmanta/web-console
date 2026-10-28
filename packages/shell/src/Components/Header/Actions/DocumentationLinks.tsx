import React, { useContext } from "react";
import { Link } from "react-router";
import { Button, ToolbarItem, Tooltip } from "@patternfly/react-core";
import { BookIcon } from "@patternfly/react-icons";
import { words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";

/**
 * This component will display the documentation link.
 * The link points to the external docs site, so it never carries the user's token.
 *
 * @returns <React.FC> DocumentationLinks
 */
export const DocumentationLinks: React.FC = () => {
  const { urlManager } = useContext(DependencyContext);

  return (
    <ToolbarItem>
      <Tooltip
        content={words("dashboard.documentation.tooltip")}
        position="bottom"
        entryDelay={500}
      >
        <Link to={urlManager.getDocumentationLink()} target="_blank" rel="noopener noreferrer">
          <Button icon={<BookIcon />} aria-label="documentation link" variant="plain" />
        </Link>
      </Tooltip>
    </ToolbarItem>
  );
};
