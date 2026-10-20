import React from "react";
import { Label } from "@patternfly/react-core";
import { DryRunProgress } from "@/Core";
import { Spinner } from "@/UI/Components/Spinner";
import { words } from "@/UI/words";

interface Props {
  progress: DryRunProgress;
}

/**
 * How many resources of a dry run are checked, as "checked / total": a blue label with a spinner
 * while it still runs, a plain outline label once it is done.
 *
 * @props {Props} props - The props of the component
 *  @prop {DryRunProgress} progress - The total and the still to do resources of the dry run
 *
 * @returns {React.FC<Props>} The progress label
 */
export const DryRunProgressLabel: React.FC<Props> = ({ progress }) => {
  const total = Number(progress.total);
  const checked = total - Number(progress.todo);
  const text = words("desiredState.complianceCheck.progress")(checked, total);

  const isRunning = checked !== total;

  return (
    <Label
      isCompact
      variant="outline"
      {...(isRunning ? { color: "blue", icon: <Spinner size={8} /> } : {})}
    >
      {text}
    </Label>
  );
};
