import React from "react";
import { Button, ToolbarGroup } from "@patternfly/react-core";
import { useTriggerDryRun } from "@/Data/Queries";
import { useAppAlert } from "@/UI/Root/Components/AppAlertProvider";
import { words } from "@/UI/words";

interface Props {
  version: string;
}

/**
 * TriggerDryRunAction component
 *
 * This component allows users to trigger a dry run for a given version.
 * It displays a toast alert for error messages and a button to trigger the dry run.
 *
 * @props {Props} props - The component props
 * @prop {string} version - The version to trigger the dry run for
 *
 * @returns {React.FC<Props>} The TriggerDryRunAction component
 */
export const TriggerDryRunAction: React.FC<Props> = ({ version }) => {
  const { notifyError } = useAppAlert();
  const { mutate } = useTriggerDryRun({
    onError: (error) => {
      notifyError({
        title: words("desiredState.complianceCheck.action.dryRun.failed"),
        message: error.message,
      });
    },
  });

  const onTrigger = async () => {
    mutate(version);
  };

  return (
    <ToolbarGroup align={{ default: "alignEnd" }}>
      <Button variant="secondary" onClick={onTrigger}>
        {words("desiredState.complianceCheck.action.dryRun")}
      </Button>
    </ToolbarGroup>
  );
};
