import React, { useContext, useEffect, useState } from "react";
import { Button, Tooltip } from "@patternfly/react-core";
import { ActionDisabledTooltip } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { DotIndication } from "./DotIndicator";

interface Props {
  kind: "Deploy" | "Repair";
  tooltip: string;
  textContent: string;
}

export const ResourcePageActionButton: React.FC<Props> = ({
  kind,
  tooltip,
  textContent,
}) => {
  const [showSpinner, setShowSpinner] = useState(false);
  const { environmentModifier, commandResolver } =
    useContext(DependencyContext);
  const isHalted = environmentModifier.useIsHalted();

  const trigger = commandResolver.useGetTrigger<typeof kind>({ kind: kind });

  const handleClick = () => {
    trigger();
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
      ariaLabel={textContent}
      tooltipContent={words("environment.halt.tooltip")}
      isDisabled
    >
      <Button variant="secondary" isDisabled>
        {textContent}
      </Button>
    </ActionDisabledTooltip>
  ) : (
    <Tooltip content={tooltip} entryDelay={400}>
      <Button
        variant="secondary"
        isDisabled={showSpinner}
        onClick={() => handleClick()}
      >
        {textContent}
        {showSpinner && <DotIndication data-testid="dot-indication" />}
      </Button>
    </Tooltip>
  );
};
