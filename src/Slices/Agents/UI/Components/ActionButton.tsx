import React, { useContext } from "react";
import { Button } from "@patternfly/react-core";
import { usePauseAgent } from "@/Data/Queries/Slices/Agents";
import { DependencyContext, words } from "@/UI";
import { ActionDisabledTooltip } from "@/UI/Components";
import { GetAgentsContext } from "@S/Agents/UI/GetAgentsContext";

interface Props {
  name: string;
  paused: boolean;
}

/**
 * ActionButton - component that renders a button to pause or unpause an agent.
 * It uses the `usePauseAgent` hook to perform the pause/unpause action and displays a tooltip
 * when the environment is halted, disabling the button.
 *
 * @props {Props} props - The props for the ActionButton component.
 * @prop {string} name - The name of the agent to be paused or unpaused.
 * @prop {boolean} paused - Indicates whether the agent is currently paused.
 *
 * @returns {React.FC<Props>} A button wrapped in a tooltip that performs the pause/unpause action.
 */
export const ActionButton: React.FC<Props> = ({ name, paused }) => {
  const { environmentHandler } = useContext(DependencyContext);
  const { setErrorMessage } = useContext(GetAgentsContext);
  const { mutate } = usePauseAgent({
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });
  const onSubmit = async () => {
    mutate({ name, action: paused ? "unpause" : "pause" });
  };
  const isHalted = environmentHandler.useIsHalted();

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
