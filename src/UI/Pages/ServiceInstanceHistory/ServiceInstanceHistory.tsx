import React from "react";

interface Props {
  serviceId: string;
  instanceId: string;
  env: string;
}

export const ServiceInstanceHistory: React.FC<Props> = ({
  serviceId,
  instanceId,
  env,
}) => (
  <div aria-label="ServiceInstanceHistory">
    {JSON.stringify({ serviceId, instanceId, env }, null, 4)}
  </div>
);
