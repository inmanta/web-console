import React, { useContext } from "react";
import { Button } from "@patternfly/react-core";
import { Maybe } from "@/Core";
import { DependencyContext, words } from "@/UI";
import { ActionDisabledTooltip } from "@/UI/Components";
import { GetAgentsContext } from "@S/Agents/UI/GetAgentsContext";

interface Props {
  name: string;
  paused: boolean;
}

export const ActionButton: React.FC<Props> = ({ name, paused }) => {
  const { commandResolver, environmentModifier } =
    useContext(DependencyContext);
  const { filter, sort, pageSize, setErrorMessage } =
    useContext(GetAgentsContext);
  const agentActionTrigger = commandResolver.getTrigger<"ControlAgent">({
    kind: "ControlAgent",
    name,
    action: paused ? "unpause" : "pause",
  });
  const onSubmit = async () => {
    const result = await agentActionTrigger({
      kind: "GetAgents",
      filter,
      sort,
      pageSize,
    });
    if (Maybe.isSome(result)) {
      setErrorMessage(result.value);
    }
  };
  const isHalted = environmentModifier.useIsHalted();
  return (
    <ActionDisabledTooltip
      isDisabled={isHalted}
      ariaLabel={"agentAction"}
      tooltipContent={words("environment.halt.tooltip")}
    >
      <Button
        variant="secondary"
        isDisabled={isHalted}
        isSmall
        onClick={onSubmit}
      >
        {paused
          ? words("agents.actions.unpause")
          : words("agents.actions.pause")}
      </Button>
    </ActionDisabledTooltip>
  );
};
