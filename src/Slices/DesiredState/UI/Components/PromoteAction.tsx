import React, { useContext, useEffect } from "react";
import { DropdownItem } from "@patternfly/react-core";
import { ParsedNumber } from "@/Core";
import { usePromoteVersion } from "@/Data/Managers/V2/PromoteVersion";
import { ActionDisabledTooltip } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { GetDesiredStatesContext } from "@S/DesiredState/UI/GetDesiredStatesContext";

interface Props {
  version: ParsedNumber;
  isDisabled: boolean;
}

export const PromoteAction: React.FC<Props> = ({ version, isDisabled }) => {
  const { environmentModifier, environmentHandler } =
    useContext(DependencyContext);
  const { setErrorMessage } = useContext(GetDesiredStatesContext);
  const { mutate, isError, error } = usePromoteVersion(
    environmentHandler.useId(),
  );
  const onSubmit = () => {
    mutate(version.toString());
  };
  const isHalted = environmentModifier.useIsHalted();

  useEffect(() => {
    if (isError) {
      setErrorMessage(error.message);
    }
  }, [isError, error, setErrorMessage]);

  return (
    <ActionDisabledTooltip
      isDisabled={isDisabled || isHalted}
      testingId={"promote"}
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
