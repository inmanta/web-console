import { ConfirmationDialog } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Button } from "@patternfly/react-core";
import { StopIcon } from "@patternfly/react-icons";
import React, { useContext } from "react";

interface Props {
  environment: string;
}
export const HaltDialog: React.FC<Props> = ({ environment }) => {
  const { commandResolver } = useContext(DependencyContext);

  const haltEnvironmentTrigger = commandResolver.getTrigger<"HaltEnvironment">({
    kind: "HaltEnvironment",
  });
  return (
    <ConfirmationDialog
      modalButton={
        <Button variant="danger" icon={<StopIcon />}>
          {words("environment.halt.button")}
        </Button>
      }
      onConfirm={haltEnvironmentTrigger}
      modalContent={words("environment.halt.details")(environment)}
      title={words("environment.halt.title")}
      confirmText={words("yes")}
      cancelText={words("no")}
    />
  );
};
