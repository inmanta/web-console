import React, { useContext } from "react";
import { Button, ToolbarItem, Tooltip } from "@patternfly/react-core";
import { CodeIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { Link } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

export const GraphiQLButton: React.FC = () => {
  const { routeManager } = useContext(DependencyContext);

  return (
    <ToolbarItem>
      <Tooltip content={words("dashboard.graphiql.tooltip")} position="bottom" entryDelay={500}>
        <StyledLink pathname={routeManager.getUrl("GraphiQL", undefined)} envOnly>
          <Button icon={<CodeIcon />} aria-label="GraphiQL action" variant="plain" />
        </StyledLink>
      </Tooltip>
    </ToolbarItem>
  );
};

const StyledLink = styled(Link)`
  padding-left: 8px;
  padding-right: 8px;
`;
