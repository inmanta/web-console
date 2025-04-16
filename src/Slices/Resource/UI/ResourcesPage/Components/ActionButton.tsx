import React, { useContext, useEffect, useState } from "react";
import { Button, Tooltip } from "@patternfly/react-core";
import { useDeploy } from "@/Data/Managers/V2/Agents";
import { ActionDisabledTooltip } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { CompileReportsIndication } from "./CompileReportsIndication";

interface Props {
  kind: "Deploy" | "Repair";
  tooltip: string;
  textContent: string;
}

export const ResourcePageActionButton: React.FC<Props> = ({ kind, tooltip, textContent }) => {
  const [showSpinner, setShowSpinner] = useState(false);
  const { environmentModifier } = useContext(DependencyContext);
  const isHalted = environmentModifier.useIsHalted();

  const { mutate } = useDeploy();

  const handleClick = () => {
    mutate({
      method: kind,
    });
    setShowSpinner(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpinner(false);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [showSpinner]);

  return isHalted ? (
    <ActionDisabledTooltip
      testingId={textContent}
      tooltipContent={words("environment.halt.tooltip")}
      isDisabled
    >
      <Button variant="secondary" isDisabled>
        {textContent}
      </Button>
    </ActionDisabledTooltip>
  ) : (
    <Tooltip content={tooltip} entryDelay={400}>
      <Button variant="secondary" isDisabled={showSpinner} onClick={() => handleClick()}>
        {textContent}
        {showSpinner && <CompileReportsIndication data-testid="dot-indication" />}
      </Button>
    </Tooltip>
  );
};
