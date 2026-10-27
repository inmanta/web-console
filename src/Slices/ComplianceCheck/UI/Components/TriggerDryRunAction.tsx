import React, { useContext } from "react";
import { Button } from "@patternfly/react-core";
import { EyeIcon } from "@patternfly/react-icons";
import { words } from "@/Core";
import { useTriggerDryRun } from "@/Data/Queries/Slices/DryRun";
import { ActionDisabledTooltip } from "@/UI/Components/ActionDisabledTooltip";
import { DependencyContext } from "@/UI/Dependency";
import { useAppAlert } from "@/UI/Dependency/AppAlertContext";

interface Props {
  version: string;
  onDryRunStart: () => void;
}

/**
 * TriggerDryRunAction component
 *
 * This component allows users to trigger a dry run for a given version.
 * It displays a toast alert for error messages and a button to trigger the dry run, which is
 * disabled while the environment is halted and while a dry run is starting.
 *
 * @props {Props} props - The component props
 * @prop {string} version - The version to trigger the dry run for
 * @prop {() => void} onDryRunStart - Called when the dry run is started
 *
 * @returns {React.FC<Props>} The TriggerDryRunAction component
 */
export const TriggerDryRunAction: React.FC<Props> = ({ version, onDryRunStart }) => {
  const { environmentHandler } = useContext(DependencyContext);
  const isHalted = environmentHandler.useIsHalted();
  const { notifyError } = useAppAlert();
  const { mutate, isPending } = useTriggerDryRun({
    onError: (error) => {
      notifyError({
        title: words("desiredState.complianceCheck.action.dryRun.failed"),
        message: error.message,
      });
    },
  });

  const onTrigger = () => {
    onDryRunStart();
    mutate(version);
  };

  return (
    <ActionDisabledTooltip
      testingId="TriggerDryRun"
      tooltipContent={words("environment.halt.tooltip")}
      isDisabled={isHalted}
    >
      <Button
        variant="secondary"
        icon={<EyeIcon />}
        onClick={onTrigger}
        isDisabled={isHalted || isPending}
      >
        {words("desiredState.complianceCheck.action.dryRun")}
      </Button>
    </ActionDisabledTooltip>
  );
};
