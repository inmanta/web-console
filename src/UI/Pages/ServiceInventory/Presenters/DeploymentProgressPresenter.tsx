import React from "react";
import { DeploymentProgress } from "@/Core";
import { StackedProgressBar } from "@/UI/Components";

export class DeploymentProgressPresenter {
  getDeploymentProgressBar(
    deploymentProgress?: DeploymentProgress
  ): React.ReactElement {
    if (!deploymentProgress) {
      return (
        <StackedProgressBar total={0} failed={0} success={0} waiting={0} />
      );
    }
    return (
      <StackedProgressBar
        total={deploymentProgress.total}
        failed={deploymentProgress.failed}
        success={deploymentProgress.deployed}
        waiting={deploymentProgress.waiting}
      />
    );
  }
}
