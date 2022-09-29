import React from "react";
import { Button } from "@patternfly/react-core";
import {
  AngleDoubleDownIcon,
  AngleDoubleUpIcon,
} from "@patternfly/react-icons";

interface ToggleAllProps {
  isExpanding: boolean;
  onToggle: () => void;
  [k: string]: unknown;
}

export const ToggleAll: React.FC<ToggleAllProps> = ({
  isExpanding,
  onToggle,
  ...props
}) => (
  <Button variant="plain" onClick={onToggle} {...props}>
    {isExpanding ? <AngleDoubleUpIcon /> : <AngleDoubleDownIcon />}
  </Button>
);
