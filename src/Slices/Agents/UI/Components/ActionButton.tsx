import React, { useContext } from "react";
import { Button } from "@patternfly/react-core";
import { usePauseAgent } from "@/Data/Managers/V2/Miscellaneous";
import { DependencyContext, words } from "@/UI";
import { ActionDisabledTooltip } from "@/UI/Components";
import { GetAgentsContext } from "@S/Agents/UI/GetAgentsContext";

interface Props {
  name: string;
  paused: boolean;
}

export const ActionButton: React.FC<Props> = ({ name, paused }) => {
  const { environmentModifier } = useContext(DependencyContext);
  const { setErrorMessage } = useContext(GetAgentsContext);
  const { mutate } = usePauseAgent({
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });
  const onSubmit = async () => {
    mutate({ name, action: paused ? "unpause" : "pause" });
  };
  const isHalted = environmentModifier.useIsHalted();

  return (
    <ActionDisabledTooltip
      isDisabled={isHalted}
      testingId={"agentAction"}
      tooltipContent={words("environment.halt.tooltip")}
    >
      <Button
        variant="secondary"
        isDisabled={isHalted}
        aria-disabled={isHalted}
        size="sm"
        onClick={onSubmit}
      >
        {paused ? words("agents.actions.unpause") : words("agents.actions.pause")}
      </Button>
    </ActionDisabledTooltip>
  );
};
