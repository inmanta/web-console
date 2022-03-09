import React, { useContext, useState } from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  Flex,
  FlexItem,
  KebabToggle,
} from "@patternfly/react-core";
import { Maybe } from "@/Core";
import { DependencyContext, words } from "@/UI";
import { ActionDisabledTooltip } from "@/UI/Components";
import { GetAgentsContext } from "./GetAgentsContext";

interface Props {
  name: string;
  paused: boolean;
}

export const Actions: React.FC<Props> = ({ name, paused }) => {
  const { commandResolver } = useContext(DependencyContext);
  const deploy = commandResolver.getTrigger<"Deploy">({ kind: "Deploy" });
  const repair = commandResolver.getTrigger<"Repair">({ kind: "Repair" });
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Flex
      direction={{ default: "row" }}
      spaceItems={{ default: "spaceItemsNone" }}
      justifyContent={{ default: "justifyContentFlexEnd" }}
    >
      <FlexItem>
        <AgentActionButton name={name} paused={paused} />
      </FlexItem>
      <FlexItem>
        <Dropdown
          toggle={<KebabToggle onToggle={() => setIsOpen(!isOpen)} />}
          isOpen={isOpen}
          isPlain
          onSelect={() => setIsOpen(false)}
          position="right"
          dropdownItems={[
            <DropdownItem
              key="deploy"
              isDisabled={paused}
              onClick={() => deploy([name])}
              component="button"
            >
              {words("agents.actions.deploy")}
            </DropdownItem>,
            <DropdownItem
              key="repair"
              isDisabled={paused}
              onClick={() => repair([name])}
              component="button"
            >
              {words("agents.actions.repair")}
            </DropdownItem>,
          ]}
        />
      </FlexItem>
    </Flex>
  );
};

export const AgentActionButton: React.FC<Props> = ({ name, paused }) => {
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
