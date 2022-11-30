import React, { useContext, useState } from "react";
import { Button, ToolbarGroup } from "@patternfly/react-core";
import { Maybe } from "@/Core";
import { ToastAlert } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  version: string;
  updateList(): void;
}

export const TriggerDryRunAction: React.FC<Props> = ({
  version,
  updateList,
}) => {
  const { commandResolver } = useContext(DependencyContext);
  const [errorMessage, setErrorMessage] = useState("");
  const trigger = commandResolver.useGetTrigger<"TriggerDryRun">({
    kind: "TriggerDryRun",
    version,
  });

  const onTrigger = async () => {
    const error = await trigger();
    if (Maybe.isSome(error)) {
      setErrorMessage(error.value);
    }
    updateList();
  };

  return (
    <ToolbarGroup alignment={{ default: "alignRight" }}>
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
