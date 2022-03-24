import React, { useContext } from "react";
import { Button } from "@patternfly/react-core";
import { ActionDisabledTooltip } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

export const DeployButton: React.FC = () => {
  const { environmentModifier, commandResolver } =
    useContext(DependencyContext);
  const isHalted = environmentModifier.useIsHalted();
  const trigger = commandResolver.getTrigger<"Deploy">({ kind: "Deploy" });
  return (
    <ActionDisabledTooltip
      isDisabled={isHalted}
      ariaLabel={words("resources.deploySummary.deploy")}
      tooltipContent={words("environment.halt.tooltip")}
    >
      <Button
        variant="secondary"
        isDisabled={isHalted}
        onClick={() => trigger()}
      >
        {words("resources.deploySummary.deploy")}
      </Button>
    </ActionDisabledTooltip>
  );
};
