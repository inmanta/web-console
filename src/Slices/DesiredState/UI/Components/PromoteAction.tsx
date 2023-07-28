import React, { useContext } from "react";
import { DropdownItem } from "@patternfly/react-core";
import { Maybe, ParsedNumber } from "@/Core";
import { ActionDisabledTooltip } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { GetDesiredStatesContext } from "@S/DesiredState/UI/GetDesiredStatesContext";

interface Props {
  version: ParsedNumber;
  isDisabled: boolean;
}

export const PromoteAction: React.FC<Props> = ({ version, isDisabled }) => {
  const { commandResolver, environmentModifier } =
    useContext(DependencyContext);
  const { filter, pageSize, setErrorMessage } = useContext(
    GetDesiredStatesContext,
  );
  const promoteVersionTrigger = commandResolver.useGetTrigger<"PromoteVersion">(
    {
      kind: "PromoteVersion",
      version,
    },
  );
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
      <DropdownItem isDisabled={isDisabled || isHalted} onClick={onSubmit}>
        {words("desiredState.actions.promote")}
      </DropdownItem>
    </ActionDisabledTooltip>
  );
};
