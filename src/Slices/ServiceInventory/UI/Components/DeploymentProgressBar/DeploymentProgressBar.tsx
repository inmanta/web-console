import React from "react";
import {
  t_global_color_status_success_default,
  t_global_color_status_danger_default,
  chart_color_blue_300,
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
      backgroundColor: t_global_color_status_success_default.var,
    },

    {
      id: "failed",
      label: words("inventory.deploymentProgress.failed"),
      value: Number(progress.failed),
      backgroundColor: t_global_color_status_danger_default.var,
    },
    {
      id: "waiting",
      label: words("inventory.deploymentProgress.waiting"),
      value: Number(progress.waiting),
      backgroundColor: chart_color_blue_300.var,
    },
  ].filter((item) => item.value > 0);
}
