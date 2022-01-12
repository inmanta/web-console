import React, { useContext } from "react";
import { Button } from "@patternfly/react-core";
import { ActionDisabledTooltip } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

export const RepairButton: React.FC = () => {
  const { environmentModifier, commandResolver } =
    useContext(DependencyContext);
  const isHalted = environmentModifier.useIsHalted();
  const trigger = commandResolver.getTrigger<"Repair">({ kind: "Repair" });
  return (
    <ActionDisabledTooltip
      isDisabled={isHalted}
      ariaLabel={words("resources.deploySummary.repair")}
      tooltipContent={words("environment.halt.tooltip")}
    >
      <Button
        variant="secondary"
        isDisabled={isHalted}
        onClick={() => trigger()}
      >
        {words("resources.deploySummary.repair")}
      </Button>
    </ActionDisabledTooltip>
  );
};
