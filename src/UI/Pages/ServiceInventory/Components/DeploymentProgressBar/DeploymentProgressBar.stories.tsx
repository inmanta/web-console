import React from "react";
import { Spacer } from "@/UI/Components";
import { DeploymentProgressBar } from "./DeploymentProgressBar";

export default {
  title: "Service Inventory/DeploymentProgressBar",
  component: DeploymentProgressBar,
};

export const Default = () => (
  <>
    <p>Nothing:</p>
    <DeploymentProgressBar progress={undefined} />
    <Spacer />
    <p>Deployed:</p>
    <DeploymentProgressBar progress={{ deployed: 5, failed: 0, waiting: 0 }} />
    <Spacer />
    <p>Failed:</p>
    <DeploymentProgressBar progress={{ deployed: 0, failed: 22, waiting: 0 }} />
    <Spacer />
    <p>Waiting:</p>
    <DeploymentProgressBar progress={{ deployed: 0, failed: 0, waiting: 99 }} />
    <Spacer />
    <p>Mix:</p>
    <DeploymentProgressBar progress={{ deployed: 3, failed: 2, waiting: 33 }} />
    <Spacer />
  </>
);
