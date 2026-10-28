import React, { useContext } from "react";
import { Link } from "react-router";
import { Button, ToolbarItem, Tooltip } from "@patternfly/react-core";
import { BookIcon, FileCodeIcon } from "@patternfly/react-icons";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

/**
 * This component will display the documentation link and the general API link.
 * The documentation link points to the external docs site, so it never carries the user's token.
 *
 * @returns <React.FC> DocumentationLinks
 */
export const DocumentationLinks: React.FC = () => {
  const { urlManager, authHelper } = useContext(DependencyContext);

  // A new tab can't send the Authorization header, so the orchestrator's /api/v2/docs endpoint
  // reads the token from the query (token_param="token"). Never add the token to external links.
  const generalApiLink = authHelper.getToken()
    ? urlManager.getGeneralAPILink() + "?token=" + authHelper.getToken()
    : urlManager.getGeneralAPILink();

  return (
    <>
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
      <ToolbarItem>
        <Tooltip content={words("dashboard.API.tooltip")} position="bottom" entryDelay={500}>
          <Link to={generalApiLink} target="_blank">
            <Button icon={<FileCodeIcon />} aria-label="general API link" variant="plain" />
          </Link>
        </Tooltip>
      </ToolbarItem>
    </>
  );
};
