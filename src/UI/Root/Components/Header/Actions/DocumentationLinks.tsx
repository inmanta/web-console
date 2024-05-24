import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Button, ToolbarItem, Tooltip } from "@patternfly/react-core";
import { BookIcon, FileCodeIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

export const DocumentationLinks: React.FC = () => {
  const { urlManager } = useContext(DependencyContext);
  return (
    <>
      <StyledToolbarItem>
        <Tooltip
          content={words("dashboard.documentation.tooltip")}
          position="bottom"
          entryDelay={500}
        >
          <StyledLink to={urlManager.getDocumentationLink()} target="_blank">
            <Button aria-label="documentation link" variant="plain">
              <BookIcon />
            </Button>
          </StyledLink>
        </Tooltip>
      </StyledToolbarItem>
      <StyledToolbarItem>
        <Tooltip
          content={words("dashboard.API.tooltip")}
          position="bottom"
          entryDelay={500}
        >
          <StyledLink to={urlManager.getGeneralAPILink()} target="_blank">
            <Button aria-label="general API link" variant="plain">
              <FileCodeIcon />
            </Button>
          </StyledLink>
        </Tooltip>
      </StyledToolbarItem>
    </>
  );
};

const StyledToolbarItem = styled(ToolbarItem)`
  &:hover {
    background-color: var(--pf-v5-global--primary-color--200);
  }
`;

const StyledLink = styled(Link)`
  padding-left: 8px;
  padding-right: 8px;
`;
