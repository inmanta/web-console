import React, { useContext } from "react";
import { DropdownItem } from "@patternfly/react-core";
import { ParsedNumber, words } from "@/Core";
import { useTriggerDryRun } from "@/Data/Queries/Slices/DryRun";
import { ActionDisabledTooltip } from "@/UI/Components/ActionDisabledTooltip";
import { useNotifyDryRunStarted } from "@/UI/Components/ResourceActions";
import { DependencyContext } from "@/UI/Dependency";
import { useAppAlert } from "@/UI/Dependency/AppAlertContext";

interface Props {
  version: ParsedNumber;
}

/**
 * DryRunAction is the menu item that starts a dry run on a whole desired state version, whatever its
 * status. Its toast links to the new report, and it is disabled while the environment is halted.
 *
 * @props {Props} props - The props of the component.
 * @prop {ParsedNumber} version - The desired state version to dry run
 *
 * @returns {React.FC<Props>} The dry run dropdown item wrapped in a tooltip.
 */
export const DryRunAction: React.FC<Props> = ({ version }) => {
  const { environmentHandler } = useContext(DependencyContext);
  const isHalted = environmentHandler.useIsHalted();
  const { notifyError } = useAppAlert();
  const notifyDryRunStarted = useNotifyDryRunStarted();
  const { mutate } = useTriggerDryRun({
    onSuccess: (id) => notifyDryRunStarted({ id, modelVersion: Number(version) }),
    onError: (error) =>
      notifyError({
        title: words("desiredState.complianceCheck.action.dryRun.failed"),
        message: error.message,
      }),
  });

  return (
    <ActionDisabledTooltip
      isDisabled={isHalted}
      testingId="dryRun"
      tooltipContent={words("environment.halt.tooltip")}
    >
      <DropdownItem isDisabled={isHalted} onClick={() => mutate(version.toString())}>
        {words("resources.resourceActions.dryRun")}
      </DropdownItem>
    </ActionDisabledTooltip>
  );
};
