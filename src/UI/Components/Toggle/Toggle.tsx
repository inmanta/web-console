import React from "react";
import { Button } from "@patternfly/react-core";
import { AngleDownIcon, AngleRightIcon } from "@patternfly/react-icons";

interface ToggleProps {
  expanded: boolean;
  onToggle: () => void;
}

export const Toggle: React.FC<ToggleProps> = ({ expanded, onToggle }) => (
  <Button variant="plain" aria-label="Toggle" onClick={onToggle}>
    {expanded ? <AngleDownIcon /> : <AngleRightIcon />}
  </Button>
);
