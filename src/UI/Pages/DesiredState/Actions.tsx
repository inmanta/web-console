import React, { useContext } from "react";
import { Button, Flex, FlexItem } from "@patternfly/react-core";
import { Maybe } from "@/Core";
import { ActionDisabledTooltip } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { GetDesiredStatesContext } from "./GetDesiredStatesContext";

interface Props {
  version: number;
  isPromoteDisabled: boolean;
}

export const Actions: React.FC<Props> = ({ version, isPromoteDisabled }) => (
  <Flex direction={{ default: "column", "2xl": "row" }}>
    <FlexItem>
      <Button isDisabled variant="primary">
        {words("desiredState.actions.details")}
      </Button>
    </FlexItem>
    <FlexItem>
      <PromoteVersionButton version={version} isDisabled={isPromoteDisabled} />
    </FlexItem>
  </Flex>
);

const PromoteVersionButton: React.FC<{
  version: number;
  isDisabled: boolean;
}> = ({ version, isDisabled }) => {
  const { commandResolver, environmentModifier } =
    useContext(DependencyContext);
  const { filter, pageSize, setErrorMessage } = useContext(
    GetDesiredStatesContext
  );
  const promoteVersionTrigger = commandResolver.getTrigger<"PromoteVersion">({
    kind: "PromoteVersion",
    version,
  });
  const onSubmit = async () => {
    const result = await promoteVersionTrigger({
      kind: "GetDesiredStates",
      filter,
      pageSize,
    });
    if (Maybe.isSome(result)) {
      setErrorMessage(result.value);
    }
  };
  const isHalted = environmentModifier.useIsHalted();
  return (
    <ActionDisabledTooltip
      isDisabled={isDisabled || isHalted}
      ariaLabel={"promote"}
      tooltipContent={
        isHalted
          ? words("environment.halt.tooltip")
          : words("desiredState.actions.promote.disabledTooltip")
      }
    >
      <Button
        isDisabled={isDisabled || isHalted}
        variant="primary"
        onClick={onSubmit}
      >
        {words("desiredState.actions.promote")}
      </Button>
    </ActionDisabledTooltip>
  );
};
