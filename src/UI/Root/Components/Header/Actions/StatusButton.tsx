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
    document.addEventListener("status-down", () => {
      setStatusColor("red");
    });
    document.addEventListener("status-up", () => {
      setStatusColor("currentColor");
    });
    return () => {
      document.removeEventListener("status-down", () => {
        setStatusColor("red");
      });
      document.removeEventListener("status-up", () => {
        setStatusColor("currentColor");
      });
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
