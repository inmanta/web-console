import React from "react";
import { Button } from "@patternfly/react-core";
import {
  AngleDoubleDownIcon,
  AngleDoubleUpIcon,
} from "@patternfly/react-icons";

interface ToggleAllProps {
  isExpanded: boolean;
  onToggle: () => void;
  [k: string]: unknown;
}

export const ToggleAll: React.FC<ToggleAllProps> = ({
  isExpanded,
  onToggle,
  ...props
}) => (
  <Button variant="plain" onClick={onToggle} {...props}>
    {isExpanded ? <AngleDoubleUpIcon /> : <AngleDoubleDownIcon />}
  </Button>
);
