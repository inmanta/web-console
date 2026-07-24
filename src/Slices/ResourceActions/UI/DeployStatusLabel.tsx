import React from "react";
import { Label } from "@patternfly/react-core";

interface Props {
  status: string | null;
}

const colors: Record<string, React.ComponentProps<typeof Label>["color"]> = {
  deployed: "green",
  failed: "red",
  skipped: "orange",
  skipped_for_dependency: "orange",
  cancelled: "grey",
  unavailable: "grey",
  undefined: "grey",
  deploying: "blue",
  available: "blue",
  processing_events: "blue",
};

/**
 * Displays the deploy status of a resource action as a colored label.
 *
 * @props {Props} props - The props of the component.
 *  @prop {string | null} status - The status of the resource action.
 * @returns {React.FC<Props>} The deploy status label.
 */
export const DeployStatusLabel: React.FC<Props> = ({ status }) => {
  if (!status) {
    return <>-</>;
  }

  return (
    <Label color={colors[status] ?? "grey"} isCompact>
      {status}
    </Label>
  );
};
