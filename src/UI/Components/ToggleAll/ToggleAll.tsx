import React from "react";
import { Button } from "@patternfly/react-core";
import { CollapseAll, ExpandAll } from "./Icons";

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
    {isExpanded ? <ExpandAll /> : <CollapseAll />}
  </Button>
);
