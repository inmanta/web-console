import React, { useContext } from "react";
import { DropdownItem } from "@patternfly/react-core";
import { ParsedNumber } from "@/Core";
import { usePromoteDesiredStateVersion } from "@/Data/Managers/V2/DesiredState";
import { ActionDisabledTooltip } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { GetDesiredStatesContext } from "@S/DesiredState/UI/GetDesiredStatesContext";

interface Props {
  version: ParsedNumber;
  isDisabled: boolean;
}

/**
 * PromoteAction component which holds the logic for promoting a desired state version.
 *
 * @note to be able to Promote a desired state version, we need to disable auto_deploy setting in the application.
 *
 * @props {Props} props - The props of the component.
 * @prop version {ParsedNumber} - the version to promote
 * @prop isDisabled {boolean} - if the action is disabled
 * @returns {React.FC<Props>} - The dropdown item that has logic to promote the desired state version wrapped in tooltip.
 */
export const PromoteAction: React.FC<Props> = ({ version, isDisabled }) => {
  const { environmentHandler } = useContext(DependencyContext);
  const { setErrorMessage } = useContext(GetDesiredStatesContext);
  const { mutate } = usePromoteDesiredStateVersion({
    onError: (error) => setErrorMessage(error.message),
  });
  const isHalted = environmentHandler.useIsHalted();

  /**
   * method triggering mutation to promote the desired state version
   *
   * @returns {void}
   * */
  const onSubmit = () => {
    mutate(version.toString());
  };

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
