import React, { useContext } from "react";
import { Button } from "@patternfly/react-core";
import { EyeIcon } from "@patternfly/react-icons";
import { useTriggerDryRun } from "@/Data/Queries";
import { ActionDisabledTooltip } from "@/UI/Components/ActionDisabledTooltip";
import { DependencyContext } from "@/UI/Dependency";
import { useAppAlert } from "@/UI/Root/Components/AppAlertProvider";
import { words } from "@/UI/words";

interface Props {
  version: string;
  onDryRunStarted: (dryRunId: string) => void;
}

/**
 * TriggerDryRunAction component
 *
 * This component allows users to trigger a dry run for a given version.
 * It displays a toast alert for error messages and a button to trigger the dry run, which is
 * disabled while the environment is halted.
 *
 * @props {Props} props - The component props
 * @prop {string} version - The version to trigger the dry run for
 * @prop {(dryRunId: string) => void} onDryRunStarted - Called with the id of the new dry run
 *
 * @returns {React.FC<Props>} The TriggerDryRunAction component
 */
export const TriggerDryRunAction: React.FC<Props> = ({ version, onDryRunStarted }) => {
  const { environmentHandler } = useContext(DependencyContext);
  const isHalted = environmentHandler.useIsHalted();
  const { notifyError } = useAppAlert();
  const { mutate } = useTriggerDryRun({
    onError: (error) => {
      notifyError({
        title: words("desiredState.complianceCheck.action.dryRun.failed"),
        message: error.message,
      });
    },
  });

  // Passed to mutate rather than the hook, so it is skipped once the page is left: selecting the
  // report rewrites the URL, which would otherwise navigate back here.
  const onTrigger = () => mutate(version, { onSuccess: onDryRunStarted });

  return (
    <ActionDisabledTooltip
      testingId="TriggerDryRun"
      tooltipContent={words("environment.halt.tooltip")}
      isDisabled={isHalted}
    >
      <Button variant="secondary" icon={<EyeIcon />} onClick={onTrigger} isDisabled={isHalted}>
        {words("desiredState.complianceCheck.action.dryRun")}
      </Button>
    </ActionDisabledTooltip>
  );
};
