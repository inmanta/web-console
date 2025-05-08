import React, { useContext } from "react";
import { Link } from "react-router";
import { Button, ToolbarItem, Tooltip } from "@patternfly/react-core";
import { BookIcon, FileCodeIcon } from "@patternfly/react-icons";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

/**
 * This component will display the documentation link and the general API link.
 * If the user is authenticated, the documentation link will be displayed with the token.
 *
 * @returns <React.FC> DocumentationLinks
 */
export const DocumentationLinks: React.FC = () => {
  const { urlManager, authHelper } = useContext(DependencyContext);

  const documentationLink = urlManager.getDocumentationLink();
  const generalApiLink = urlManager.getGeneralAPILink();

  // If the user is authenticated, we need to add the token to the documentation link to allow access to the page.
  const getUrl = (link: string) => {
    if (authHelper.getToken()) {
      return link + "?token=" + authHelper.getToken();
    }

    return link;
  };

  return (
    <>
      <ToolbarItem>
        <Tooltip
          content={words("dashboard.documentation.tooltip")}
          position="bottom"
          entryDelay={500}
        >
          <Link to={getUrl(documentationLink)} target="_blank">
            <Button icon={<BookIcon />} aria-label="documentation link" variant="plain" />
          </Link>
        </Tooltip>
      </ToolbarItem>
      <ToolbarItem>
        <Tooltip content={words("dashboard.API.tooltip")} position="bottom" entryDelay={500}>
          <Link to={getUrl(generalApiLink)} target="_blank">
            <Button icon={<FileCodeIcon />} aria-label="general API link" variant="plain" />
          </Link>
        </Tooltip>
      </ToolbarItem>
    </>
  );
};
