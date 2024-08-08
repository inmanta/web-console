import React from "react";
import {
  global_danger_color_100,
  global_primary_color_100,
  global_success_color_100,
} from "@patternfly/react-tokens";
import { DeploymentProgress } from "@/Core";
import { LegendBar, LegendItemDetails } from "@/UI/Components";
import { words } from "@/UI/words";

type Progress = Omit<DeploymentProgress, "total"> | undefined | null;

interface Props {
  progress: Progress;
}

export const DeploymentProgressBar: React.FC<Props> = ({ progress }) => (
  <LegendBar
    items={fromProgressToItems(progress)}
    label={words("inventory.deploymentProgress.notFound")}
  />
);

function fromProgressToItems(progress: Progress): LegendItemDetails[] {
  if (progress === undefined || progress === null) return [];
  return [
    {
      id: "deployed",
      label: words("inventory.deploymentProgress.deployed"),
      value: Number(progress.deployed),
      backgroundColor: global_success_color_100.var,
    },

    {
      id: "failed",
      label: words("inventory.deploymentProgress.failed"),
      value: Number(progress.failed),
      backgroundColor: global_danger_color_100.var,
    },
    {
      id: "waiting",
      label: words("inventory.deploymentProgress.waiting"),
      value: Number(progress.waiting),
      backgroundColor: global_primary_color_100.var,
    },
  ].filter((item) => item.value > 0);
}
