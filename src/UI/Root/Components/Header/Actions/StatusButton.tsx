import React, { useContext, useEffect, useState } from "react";
import { Button, ToolbarItem, Tooltip } from "@patternfly/react-core";
import { PortIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { useGetHealth } from "@/Data/Queries";
import { Link } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

export const StatusButton: React.FC = () => {
  const [isEnvironmentDown, setIsEnvironmentDown] = useState(false);
  const { routeManager } = useContext(DependencyContext);
  const { isError: isHealthDown } = useGetHealth().useContinuous();

  useEffect(() => {
    const changeStatusToRed = () => setIsEnvironmentDown(true);
    const changeStatusToCurrent = () => setIsEnvironmentDown(false);

    document.addEventListener("status-down", changeStatusToRed);
    document.addEventListener("status-up", changeStatusToCurrent);

    return () => {
      document.removeEventListener("status-down", changeStatusToRed);
      document.removeEventListener("status-up", changeStatusToCurrent);
    };
  }, []);

  const statusColor = isEnvironmentDown || isHealthDown ? "red" : "currentColor";

  return (
    <ToolbarItem>
      <Tooltip content={words("dashboard.status_page.tooltip")} position="bottom" entryDelay={500}>
        <StyledLink pathname={routeManager.getUrl("Status", undefined)} envOnly>
          <Button
            icon={<StyledIcon color={statusColor} />}
            aria-label="ServerStatus action"
            variant="plain"
          />
        </StyledLink>
      </Tooltip>
    </ToolbarItem>
  );
};

const StyledIcon = styled(PortIcon)`
  color: ${(props) => props.color};
`;

const StyledLink = styled(Link)`
  padding-left: 8px;
  padding-right: 8px;
`;
