import React, { useContext, useEffect, useState } from "react";
import { Button, ToolbarItem } from "@patternfly/react-core";
import { RunningIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { Link } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";

export const StatusButton: React.FC = () => {
  const [statusColor, setStatusColor] = useState("currentColor");
  const { routeManager } = useContext(DependencyContext);
  useEffect(() => {
    const changeStatusToRed = () => setStatusColor("red");
    const changeStatusToCurrent = () => setStatusColor("currentColor");

    document.addEventListener("status-down", changeStatusToRed);
    document.addEventListener("status-up", changeStatusToCurrent);

    return () => {
      document.removeEventListener("status-down", changeStatusToRed);
      document.removeEventListener("status-up", changeStatusToCurrent);
    };
  }, []);

  return (
    <ToolbarItem>
      <Link pathname={routeManager.getUrl("Status", undefined)} envOnly>
        <Button aria-label="ServerStatus action" variant="plain">
          <StyledIcon color={statusColor} />
        </Button>
      </Link>
    </ToolbarItem>
  );
};

const StyledIcon = styled(RunningIcon)`
  color: ${(props) => props.color};
`;
