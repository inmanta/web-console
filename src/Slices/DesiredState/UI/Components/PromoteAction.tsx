import React, { useContext } from "react";
import { DropdownItem } from "@patternfly/react-core";
import { ParsedNumber, words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { useAppAlert } from "@inmanta/web-console-core/Dependency/AppAlertContext";
import { usePromoteDesiredStateVersion } from "@inmanta/web-console-core/Queries/Slices/DesiredState";
import { ActionDisabledTooltip } from "@inmanta/web-console-ui/Components/ActionDisabledTooltip";

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
  const { notifyError } = useAppAlert();
  const { mutate } = usePromoteDesiredStateVersion({
    onError: (error) =>
      notifyError({
        title: words("desiredState.actions.promote.failed"),
        message: error.message,
      }),
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
