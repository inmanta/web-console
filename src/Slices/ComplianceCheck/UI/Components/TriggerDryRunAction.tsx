import React, { useState } from "react";
import { Button, ToolbarGroup } from "@patternfly/react-core";
import { useTriggerDryRun } from "@/Data/Queries/Slices/DryRun";
import { ToastAlert } from "@/UI/Components";
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
  const [errorMessage, setErrorMessage] = useState("");
  const { mutate } = useTriggerDryRun({
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const onTrigger = async () => {
    mutate(version);
  };

  return (
    <ToolbarGroup align={{ default: "alignEnd" }}>
      <ToastAlert
        title={words("desiredState.complianceCheck.action.dryRun.failed")}
        message={errorMessage}
        setMessage={setErrorMessage}
      />
      <Button variant="secondary" onClick={onTrigger}>
        {words("desiredState.complianceCheck.action.dryRun")}
      </Button>
    </ToolbarGroup>
  );
};
