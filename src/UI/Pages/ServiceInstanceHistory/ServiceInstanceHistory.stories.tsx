import React from "react";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";

export default {
  title: "ServiceInstanceHistory",
  component: ServiceInstanceHistory,
};

export const Default: React.FC = () => (
  <ServiceInstanceHistory
    serviceId="serviceId"
    instanceId="instanceId"
    env="env"
  />
);
