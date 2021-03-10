import React from "react";
import { useParams } from "react-router-dom";
import { EnvironmentProvider, ServiceProvider } from "@/UI/Components";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";

interface Params {
  serviceId: string;
  instanceId: string;
}

export const Provider: React.FC = () => {
  const { serviceId, instanceId } = useParams<Params>();

  return (
    <EnvironmentProvider
      Wrapper={() => <></>}
      Dependant={({ environment }) => (
        <ServiceProvider
          environmentId={environment}
          serviceName={serviceId}
          Wrapper={() => <></>}
          Dependant={({ service }) => (
            <ServiceInstanceHistory
              service={service}
              instanceId={instanceId}
              environment={environment}
            />
          )}
        />
      )}
    />
  );
};
