import React from "react";
import { Label } from "@patternfly/react-core";

interface Props {
  change: string | null;
}

const colors: Record<string, React.ComponentProps<typeof Label>["color"]> = {
  created: "green",
  updated: "blue",
  purged: "orange",
  nochange: "grey",
};

/**
 * Displays the outcome (`change`) of a deployment as a colored label.
 *
 * @props {Props} props - The props of the component.
 *  @prop {string | null} change - The change value of the resource action.
 * @returns {React.FC<Props>} The deploy outcome label.
 */
export const DeployOutcomeLabel: React.FC<Props> = ({ change }) => {
  if (!change) {
    return <>-</>;
  }

  return (
    <Label color={colors[change] ?? "grey"} isCompact>
      {change}
    </Label>
  );
};
