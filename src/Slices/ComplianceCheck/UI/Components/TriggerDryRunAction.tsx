import React, { useState } from "react";
import { Button, ToolbarGroup } from "@patternfly/react-core";
import { ToastAlert } from "@/UI/Components";
import { words } from "@/UI/words";
import { useTriggerDryRun } from "@/Data/Managers/V2/DryRun";

interface Props {
  version: string;
}

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
